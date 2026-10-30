import { reactive, watch } from 'vue'
import { seed } from '../data/mock'
const KEY = 'mentorconnect_demo_v1'
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.users) return s } catch (e) { /* ignore corrupt data */ } return seed() }
export const state = reactive(load())
watch(state, () => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) { /* storage unavailable */ } }, { deep: true })
export const resetDemo = () => { localStorage.removeItem(KEY); location.href = location.pathname }

export const toasts = reactive([])
export function toast(msg, type = 'ok') { const t = { id: Math.random(), msg, type }; toasts.push(t); setTimeout(() => toasts.splice(toasts.indexOf(t), 1), 3500) }

export const DAY = 864e5, MAX_PENDING = 3, EXPIRY_DAYS = 14
const uid = p => p + Math.random().toString(36).slice(2, 8)
export const me = () => state.users.find(u => u.id === state.sessionId)
export const userById = id => state.users.find(u => u.id === id)
export const mentors = () => state.users.filter(u => u.role === 'mentor' && u.title && u.active !== false)
export const activeMentees = id => state.mentorships.filter(m => m.mentorId === id && m.active)
export const openSlots = m => (m.paused ? 0 : Math.max(0, m.capacity - activeMentees(m.id).length))
export const pendingOf = sid => state.requests.filter(r => r.studentId === sid && r.status === 'pending')
export const notify = (userId, text, link) => state.notifications.unshift({ id: uid('n'), userId, text, link, read: false, at: Date.now() })

export function login(email, password) {
  const u = state.users.find(x => x.email.toLowerCase() === email.trim().toLowerCase())
  if (!u || u.password !== password) return { error: 'Email or password is incorrect.' }
  if (u.active === false) return { error: 'This account has been deactivated. Contact the programme admin.' }
  state.sessionId = u.id; return { user: u }
}
export const logout = () => { state.sessionId = null }
export function register({ name, email, password, role }) {
  if (state.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) return 'An account with this email already exists.'
  const base = { id: uid(role[0]), role, name: name.trim(), email: email.trim(), password }
  state.users.push(role === 'student' ? { ...base, programme: '', interests: [], needs: '', skills: [] }
    : { ...base, title: '', company: '', years: 0, industry: '', bio: '', expertise: [], support: [], capacity: 2, paused: false })
  return null
}
function move(r, to, actor, reason = '') { r.history.push({ from: r.status, to, actor, at: Date.now() }); r.status = to; if (reason) r.reason = reason }
export function submitRequest(sid, mid, message) {
  const m = userById(mid), msg = message.trim()
  if (!m || m.role !== 'mentor') return 'Mentor not found.'
  if (msg.length < 50 || msg.length > 1500) return 'Your message must be between 50 and 1500 characters.'
  if (pendingOf(sid).length >= MAX_PENDING) return `You already have ${MAX_PENDING} pending requests. Withdraw one or wait for a reply.`
  if (pendingOf(sid).some(r => r.mentorId === mid)) return 'You already have a pending request to this mentor.'
  if (openSlots(m) < 1) return m.paused ? 'This mentor has paused new requests.' : 'This mentor has no open slots.'
  const now = Date.now()
  const r = { id: uid('r'), studentId: sid, mentorId: mid, message: msg, status: 'pending', reason: '', createdAt: now, expiresAt: now + EXPIRY_DAYS * DAY, history: [{ from: null, to: 'pending', actor: 'Student', at: now }] }
  state.requests.unshift(r); notify(mid, `New mentoring request from ${userById(sid).name}`, `/mentor/requests/${r.id}`); return null
}
export function withdraw(id, sid) {
  const r = state.requests.find(x => x.id === id && x.studentId === sid)
  if (!r || r.status !== 'pending') return 'Only pending requests can be withdrawn.'
  move(r, 'withdrawn', 'Student'); notify(r.mentorId, `${userById(sid).name} withdrew a request`, '/mentor/requests'); return null
}
export function decide(id, mid, to, reason = '') {
  const r = state.requests.find(x => x.id === id && x.mentorId === mid)
  if (!r) return 'Request not found.'
  if (r.status !== 'pending') return 'This request has already been decided.'
  if (reason.length > 500) return 'Reason is limited to 500 characters.'
  if (to === 'accepted') {
    if (activeMentees(mid).length >= userById(mid).capacity) return 'You are at capacity. Raise your capacity before accepting.'
    state.mentorships.push({ id: uid('ms'), studentId: r.studentId, mentorId: mid, active: true, since: Date.now() })
  }
  move(r, to, 'Mentor', reason); notify(r.studentId, `${userById(mid).name} ${to} your request`, '/student/requests'); return null
}
// Mock expiry: a real system would use a scheduled job (US-09). Here it runs on each navigation.
export function runExpiry() {
  const now = Date.now()
  state.requests.forEach(r => { if (r.status === 'pending' && r.expiresAt < now) { move(r, 'expired', 'System'); notify(r.studentId, 'A mentoring request expired after 14 days', '/student/requests'); notify(r.mentorId, 'A pending request expired', '/mentor/requests') } })
}
export function addGoal(sid, title, target) {
  if (title.trim().length < 3) return 'Give the goal a title of at least 3 characters.'
  if (!target || new Date(target) < new Date(new Date().toDateString())) return 'Choose a target date that is today or later.'
  state.goals.push({ id: uid('g'), studentId: sid, title: title.trim(), target, status: 'todo' }); return null
}
