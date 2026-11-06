import { reactive, watch } from 'vue'
import { seed } from '../data/mock'
const KEY = 'mentorconnect_demo_v3'
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.users && s.sessions) return s } catch (e) { /* ignore corrupt data */ } return seed() }
export const state = reactive(load())
watch(state, () => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) { /* storage unavailable */ } }, { deep: true })
export const resetDemo = () => { localStorage.removeItem(KEY); location.href = location.pathname }

export const toasts = reactive([])
export function toast(msg, type = 'ok') { const t = { id: Math.random(), msg, type }; toasts.push(t); setTimeout(() => toasts.splice(toasts.indexOf(t), 1), 3500) }

export const DAY = 864e5, MAX_PENDING = 3, EXPIRY_DAYS = 14, RETENTION_DAYS = 30, EDIT_WINDOW = 15 * 60 * 1000
const uid = p => p + Math.random().toString(36).slice(2, 8)
const today0 = () => new Date(new Date().toDateString()).getTime()
export const me = () => state.users.find(u => u.id === state.sessionId)
export const userById = id => state.users.find(u => u.id === id) || { id, name: 'Unknown user', role: '', email: '' }
export const live = u => u.active !== false && !u.purged
// A mentor is visible to students only when profile is complete, admin-verified and the account is live.
export const mentors = () => state.users.filter(u => u.role === 'mentor' && u.title && u.verified && live(u))
export const activeMentees = id => state.mentorships.filter(m => m.mentorId === id && m.active)
export const openSlots = m => (m.paused ? 0 : Math.max(0, m.capacity - activeMentees(m.id).length))
export const pendingOf = sid => state.requests.filter(r => r.studentId === sid && r.status === 'pending')
export const notify = (userId, text, link) => state.notifications.unshift({ id: uid('n'), userId, text, link, read: false, at: Date.now() })
const log = (actor, text) => state.audit.unshift({ id: uid('au'), at: Date.now(), actor: typeof actor === 'string' ? actor : actor.name, text })
export const myMentorships = uidv => state.mentorships.filter(m => m.active && (m.studentId === uidv || m.mentorId === uidv))
export const mentorshipOf = (a, b) => state.mentorships.find(m => m.active && ((m.studentId === a && m.mentorId === b) || (m.studentId === b && m.mentorId === a)))
export const aliasOf = id => 'Student #' + (state.users.filter(u => u.role === 'student').findIndex(u => u.id === id) + 1)
export const relayEmail = id => 'student-' + [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7).toString(36) + '@relay.mentorconnect.demo'
export const fmtDT = t => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

/* ---------- accounts ---------- */
export function login(email, password) {
  const u = state.users.find(x => x.email.toLowerCase() === email.trim().toLowerCase())
  if (!u || u.purged || u.password !== password) return { error: 'Email or password is incorrect.' }
  if (u.active === false) return { error: u.deletionRequestedAt ? 'This account is scheduled for deletion.' : 'This account has been deactivated. Contact the programme admin.' }
  state.sessionId = u.id; return { user: u }
}
export const logout = () => { state.sessionId = null }
export function register({ name, email, password, role, extra = {} }) {
  if (state.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) return 'An account with this email already exists.'
  const base = { id: uid(role[0]), role, name: name.trim(), email: email.trim(), password }
  state.users.push(role === 'student' ? { ...base, programme: '', interests: [], needs: '', skills: [], ...extra }
    : { ...base, title: '', company: '', years: 0, industry: '', bio: '', expertise: [], support: [], capacity: 2, paused: false, verified: false, ...extra })
  if (role === 'mentor') state.users.filter(u => u.role === 'admin').forEach(a => notify(a.id, `New mentor ${name.trim()} is waiting for verification`, '/admin/dashboard?tab=users'))
  return null
}

/* ---------- requests ---------- */
function move(r, to, actor, reason = '') { r.history.push({ from: r.status, to, actor, at: Date.now() }); r.status = to; if (reason) r.reason = reason }
export function submitRequest(sid, mid, message, goalIds = []) {
  const m = userById(mid), msg = message.trim()
  if (!m || m.role !== 'mentor' || !m.verified) return 'Mentor not found.'
  if (msg.length < 50 || msg.length > 1500) return 'Your message must be between 50 and 1500 characters.'
  if (pendingOf(sid).length >= MAX_PENDING) return `You already have ${MAX_PENDING} pending requests. Withdraw one or wait for a reply.`
  if (pendingOf(sid).some(r => r.mentorId === mid)) return 'You already have a pending request to this mentor.'
  if (openSlots(m) < 1) return m.paused ? 'This mentor has paused new requests.' : 'This mentor has no open slots.'
  if (goalIds.some(id => !state.goals.some(g => g.id === id && g.studentId === sid))) return 'One of the attached goals was not found.'
  const now = Date.now()
  const r = { id: uid('r'), studentId: sid, mentorId: mid, message: msg, status: 'pending', reason: '', goalIds, createdAt: now, expiresAt: now + EXPIRY_DAYS * DAY, history: [{ from: null, to: 'pending', actor: 'Student', at: now }] }
  state.requests.unshift(r); notify(mid, `New mentoring request from ${userById(sid).name}`, `/mentor/requests/${r.id}`); return null
}
export function withdraw(id, sid) {
  const r = state.requests.find(x => x.id === id && x.studentId === sid)
  if (!r || r.status !== 'pending') return 'Only pending requests can be withdrawn.'
  move(r, 'withdrawn', 'Student'); notify(r.mentorId, `${userById(sid).name} withdrew a request`, '/mentor/requests'); return null
}
function startMentorship(studentId, mentorId, by) {
  state.mentorships.push({ id: uid('ms'), studentId, mentorId, active: true, since: Date.now(), by })
  // System rule: when a mentorship starts, the student's goals become visible to that mentor only.
  state.goals.filter(g => g.studentId === studentId).forEach(g => { g.visibility = 'mentor' })
}
export function decide(id, mid, to, reason = '') {
  const r = state.requests.find(x => x.id === id && x.mentorId === mid)
  if (!r) return 'Request not found.'
  if (r.status !== 'pending') return 'This request has already been decided.'
  if (reason.length > 500) return 'Reason is limited to 500 characters.'
  if (to === 'accepted') {
    // Capacity is re-checked at accept time (409 conflict if the last place was just taken).
    if (activeMentees(mid).length >= userById(mid).capacity) return '409 Conflict: your capacity is full, so this request cannot be accepted. Raise your capacity first.'
    startMentorship(r.studentId, mid, 'Mentor')
  }
  move(r, to, 'Mentor', reason); notify(r.studentId, `${userById(mid).name} ${to} your request`, '/student/requests'); return null
}
// Mock expiry: a real system would use a scheduled job (US-09). Here it runs on each navigation.
export function runExpiry() {
  const now = Date.now()
  state.requests.forEach(r => { if (r.status === 'pending' && r.expiresAt < now) { move(r, 'expired', 'System'); notify(r.studentId, 'A mentoring request expired after 14 days', '/student/requests'); notify(r.mentorId, 'A pending request expired', '/mentor/requests') } })
  runPurge()
}
// Mock account purge: anonymises accounts whose deletion was requested more than RETENTION_DAYS ago.
export function runPurge(force = false) {
  let n = 0
  state.users.filter(u => u.deletionRequestedAt && !u.purged && (force || Date.now() - u.deletionRequestedAt > RETENTION_DAYS * DAY)).forEach(u => {
    Object.assign(u, { name: 'Deleted user', email: `deleted-${u.id}@anonymised.invalid`, password: '', bio: '', needs: '', purged: true })
    state.requests.filter(r => r.studentId === u.id || r.mentorId === u.id).forEach(r => { r.message = '[removed]' }); n++
  })
  if (n) log('System', `Anonymised ${n} account(s) after the retention period`)
  return n
}

/* ---------- goals ---------- */
export const VIS = [['me', 'Only me'], ['all', 'All mentors (anonymous)'], ['mentor', 'Only my mentor']]
export function addGoal(sid, title, target, description = '', visibility = 'me', tags = [], shareCoord = false) {
  if (title.trim().length < 3) return 'Give the goal a title of at least 3 characters.'
  if (!target || new Date(target) < new Date(new Date().toDateString())) return 'Choose a target date that is today or later.'
  state.goals.push({ id: uid('g'), studentId: sid, title: title.trim(), description: description.trim(), target, status: 'todo', visibility, tags, shareCoord }); return null
}
export const openGoals = () => state.goals.filter(g => g.visibility === 'all' && g.status !== 'done')

/* ---------- availability and sessions ---------- */
const toMs = v => new Date(v).getTime()
function slotCheck(mid, s, e, selfId) {
  if (!s || !e || isNaN(s) || isNaN(e)) return 'Choose a start and end time.'
  if (e <= s) return 'The end time must be after the start time.'
  if (s < Date.now()) return 'Past time slots cannot be offered.'
  if (state.availability.some(a => a.mentorId === mid && a.id !== selfId && s < a.end && e > a.start)) return '409 Conflict: this overlaps one of your existing slots.'
  return null
}
export function addSlot(mid, start, end) { const s = toMs(start), e = toMs(end), er = slotCheck(mid, s, e); if (er) return er; state.availability.push({ id: uid('av'), mentorId: mid, start: s, end: e, status: 'open', sessionId: null }); return null }
export function updateSlot(id, mid, start, end) {
  const a = state.availability.find(x => x.id === id && x.mentorId === mid); if (!a) return 'Slot not found.'
  if (a.status === 'booked') return 'Booked slots cannot be changed. Cancel the session first.'
  const s = toMs(start), e = toMs(end), er = slotCheck(mid, s, e, id); if (er) return er; Object.assign(a, { start: s, end: e }); return null
}
export function removeSlot(id, mid) {
  const a = state.availability.find(x => x.id === id && x.mentorId === mid); if (!a) return 'Slot not found.'
  if (a.status === 'booked') return 'Booked slots cannot be removed. Cancel the session first.'
  state.availability.splice(state.availability.indexOf(a), 1); return null
}
export function bookSlot(slotId, sid) {
  const a = state.availability.find(x => x.id === slotId); if (!a) return 'Slot not found.'
  const ms = state.mentorships.find(m => m.active && m.studentId === sid && m.mentorId === a.mentorId)
  if (!ms) return 'You can only book mentors you have an active mentorship with.'
  if (a.status !== 'open') return '409 Conflict: this slot has just been booked by someone else.'
  if (a.start < Date.now()) return 'This slot is in the past.'
  const s = { id: uid('se'), mentorshipId: ms.id, mentorId: a.mentorId, studentId: sid, slotId: a.id, start: a.start, end: a.end, status: 'scheduled', notes: '', items: [] }
  state.sessions.push(s); a.status = 'booked'; a.sessionId = s.id
  notify(a.mentorId, `${userById(sid).name} booked a session for ${fmtDT(a.start)}`, '/mentor/sessions'); return null
}
const part = (s, u) => s && (s.studentId === u || s.mentorId === u)
export const sessionsOf = u => state.sessions.filter(s => part(s, u)).sort((a, b) => a.start - b.start)
export function cancelSession(id, actor) {
  const s = state.sessions.find(x => x.id === id); if (!part(s, actor)) return 'Session not found.'
  if (s.status !== 'scheduled') return 'Only scheduled sessions can be cancelled.'
  s.status = 'cancelled'; const a = state.availability.find(x => x.id === s.slotId); if (a) { a.status = 'open'; a.sessionId = null }
  const other = actor === s.studentId ? s.mentorId : s.studentId
  notify(other, `${userById(actor).name} cancelled the session on ${fmtDT(s.start)}`, actor === s.studentId ? '/mentor/sessions' : '/student/sessions'); return null
}
export function logNotes(id, actor, notes) {
  const s = state.sessions.find(x => x.id === id); if (!part(s, actor)) return 'Session not found.'
  if (s.start > Date.now()) return 'Session notes cannot be added before the session date.'
  if (s.status === 'cancelled') return 'This session was cancelled.'
  if (notes.trim().length < 10) return 'Write a short summary of at least 10 characters.'
  s.notes = notes.trim(); s.status = 'completed'; return null
}
export function logPastSession(msId, actor, date, time, notes) {
  const ms = state.mentorships.find(m => m.id === msId); if (!ms || !(ms.studentId === actor || ms.mentorId === actor)) return 'Mentorship not found.'
  const start = toMs(`${date}T${time || '10:00'}`); if (isNaN(start)) return 'Choose a date and time.'
  if (start > Date.now()) return 'Session dates cannot be in the future.'
  if (notes.trim().length < 10) return 'Write a short summary of at least 10 characters.'
  state.sessions.push({ id: uid('se'), mentorshipId: msId, mentorId: ms.mentorId, studentId: ms.studentId, slotId: null, start, end: start + 36e5, status: 'completed', notes: notes.trim(), items: [] }); return null
}
export function addItem(id, actor, text, assignee) {
  const s = state.sessions.find(x => x.id === id); if (!part(s, actor)) return 'Session not found.'
  if (text.trim().length < 3) return 'Describe the action item (at least 3 characters).'
  if (!['student', 'mentor'].includes(assignee)) return 'Assign the item to the student or the mentor.'
  s.items.push({ id: uid('ai'), text: text.trim(), done: false, assignee }); return null
}

/* ---------- feedback ---------- */
export function giveFeedback({ fromId, mentorshipId, kind, scores, comments, isPublic }) {
  const ms = state.mentorships.find(m => m.id === mentorshipId); if (!ms || !(ms.studentId === fromId || ms.mentorId === fromId)) return 'Mentorship not found.'
  if (!['checkin', 'final'].includes(kind)) return 'Choose check-in or final feedback.'
  if (state.criteria.some(c => !(scores[c] >= 1 && scores[c] <= 5))) return 'Rate every criterion from 1 to 5.'
  if (comments.length > 500) return 'Comments are limited to 500 characters.'
  const toId = fromId === ms.studentId ? ms.mentorId : ms.studentId
  state.feedback.push({ id: uid('f'), mentorshipId, fromId, toId, kind, scores: { ...scores }, comments: comments.trim(), isPublic: !!isPublic && kind === 'final' && fromId === ms.studentId, createdAt: Date.now() }); return null
}
export function editFeedback(id, actor, patch) {
  const f = state.feedback.find(x => x.id === id && x.fromId === actor); if (!f) return 'Feedback not found.'
  if (Date.now() - f.createdAt > EDIT_WINDOW) return 'The 15-minute edit window has closed.'
  if (state.criteria.some(c => !(patch.scores[c] >= 1 && patch.scores[c] <= 5))) return 'Rate every criterion from 1 to 5.'
  if (patch.comments.length > 500) return 'Comments are limited to 500 characters.'
  Object.assign(f, { scores: { ...patch.scores }, comments: patch.comments.trim(), isPublic: f.kind === 'final' && userById(actor).role === 'student' ? !!patch.isPublic : false }); return null
}
export function sendPlatformFeedback(text) { if (text.trim().length < 10) return 'Write at least 10 characters.'; state.platformFeedback.unshift({ id: uid('pf'), text: text.trim(), at: Date.now() }); return null } // no author stored: anonymous
export const avgScore = f => { const v = Object.values(f.scores); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '–' }

/* ---------- tags, criteria ---------- */
export const approvedTags = () => state.tags.filter(t => t.status === 'approved').map(t => t.name)
export function suggestTag(name) {
  const n = name.trim(); if (n.length < 2) return 'Tag names need at least 2 characters.'
  if (state.tags.some(t => t.name.toLowerCase() === n.toLowerCase())) return 'That tag already exists or is awaiting approval.'
  state.tags.push({ id: uid('t'), name: n, status: 'suggested' }); state.users.filter(u => u.role === 'admin').forEach(a => notify(a.id, `Tag suggested: ${n}`, '/admin/dashboard?tab=content')); return null
}
export function mergeTags(fromId, toId) {
  const a = state.tags.find(t => t.id === fromId), b = state.tags.find(t => t.id === toId); if (!a || !b || a === b) return 'Choose two different tags.'
  const swap = arr => [...new Set(arr.map(x => (x === a.name ? b.name : x)))]
  state.users.forEach(u => { if (u.expertise) u.expertise = swap(u.expertise); if (u.interests) u.interests = swap(u.interests) })
  state.goals.forEach(g => { g.tags = swap(g.tags || []) }); state.tags.splice(state.tags.indexOf(a), 1)
  log('Admin', `Merged tag "${a.name}" into "${b.name}"`); return null
}

/* ---------- moderation, accounts ---------- */
export function submitReport(reporterId, reportedId, category, description, evidence) {
  if (!reportedId) return 'Choose who you are reporting.'
  if (reportedId === reporterId) return 'You cannot report yourself.'
  if (!category) return 'Choose a category.'
  if (description.trim().length < 20) return 'Describe what happened in at least 20 characters.'
  state.reports.unshift({ id: uid('rp'), reporterId, reportedId, category, description: description.trim(), evidence: evidence || '', status: 'open', action: '', createdAt: Date.now() })
  state.users.filter(u => u.role === 'admin').forEach(a => notify(a.id, 'A new report needs review', '/admin/dashboard?tab=reports')); return null
}
export function setActive(userId, active, admin) {
  const u = userById(userId); u.active = active
  if (!active) state.requests.filter(r => r.status === 'pending' && (r.mentorId === u.id || r.studentId === u.id)).forEach(r => {
    move(r, 'withdrawn', 'Admin'); notify(r.studentId, 'A request was closed by an admin action', '/student/requests'); if (u.role === 'student') notify(r.mentorId, 'A pending request was closed by an admin action', '/mentor/requests')
  })
  log(admin, `${active ? 'Reactivated' : 'Blocked'} ${u.name}`)
}
export function verifyMentor(id, admin) { const u = userById(id); if (!u.title) return 'This mentor has not completed their profile yet.'; u.verified = true; notify(id, 'Your mentor profile is verified and now visible to students', '/mentor/profile'); log(admin, `Verified mentor ${u.name}`); return null }
export function requestDeletion(id) {
  const u = userById(id)
  state.requests.filter(r => r.status === 'pending' && (r.studentId === id || r.mentorId === id)).forEach(r => { move(r, 'withdrawn', 'System'); notify(r.studentId === id ? r.mentorId : r.studentId, 'A pending request was closed because an account was deleted', '/notifications') })
  state.mentorships.filter(m => m.active && (m.studentId === id || m.mentorId === id)).forEach(m => { m.active = false; notify(m.studentId === id ? m.mentorId : m.studentId, 'A mentorship ended because an account was deleted', '/notifications') })
  u.deletionRequestedAt = Date.now(); u.active = false; log('System', `Deletion requested by ${u.role} ${u.name}`)
}

/* ---------- matching, coordination ---------- */
export function assignMentor(studentId, mentorId, by) {
  const m = userById(mentorId), s = userById(studentId)
  if (!m.verified || !live(m) || !m.title) return 'This mentor is not available.'
  if (m.paused) return 'This mentor has paused new requests.'
  if (activeMentees(mentorId).length >= m.capacity) return '409 Conflict: this mentor has no open place, so the assignment was blocked.'
  if (mentorshipOf(studentId, mentorId)) return 'They are already matched.'
  startMentorship(studentId, mentorId, by.role); log(by, `Matched ${s.name} with ${m.name}`)
  notify(studentId, `You have been matched with ${m.name}`, '/student/dashboard'); notify(mentorId, `You have been matched with ${s.name}`, '/mentor/mentees'); return null
}
export function assignGroup(coordId, msId) { const g = state.groups[coordId] || (state.groups[coordId] = []); if (!g.includes(msId)) g.push(msId) }
export function unassignGroup(coordId, msId) { state.groups[coordId] = (state.groups[coordId] || []).filter(x => x !== msId) }
export function contactStudent(coord, studentId, text) {
  if (text.trim().length < 10) return 'Write a message of at least 10 characters.'
  state.messages.push({ id: uid('msg'), fromId: coord.id, toId: studentId, text: text.trim(), at: Date.now() })
  notify(studentId, `Message from the programme coordinator: ${text.trim().slice(0, 140)}`, '/notifications'); return null
}
export function nudgeMentor(coord, requestId) {
  const r = state.requests.find(x => x.id === requestId && x.status === 'pending'); if (!r) return 'Request not found.'
  notify(r.mentorId, `A request has been waiting ${Math.floor((Date.now() - r.createdAt) / DAY)} days. Please reply when you can.`, `/mentor/requests/${r.id}`); return null
}
export const stuckRequests = () => state.requests.filter(r => r.status === 'pending' && Date.now() - r.createdAt > 7 * DAY).map(r => ({ id: r.id, ref: 'REQ-' + r.id.slice(-3).toUpperCase(), status: r.status, ageDays: Math.floor((Date.now() - r.createdAt) / DAY) }))
export const unmatchedStudents = () => state.users.filter(u => u.role === 'student' && live(u) && !state.mentorships.some(m => m.active && m.studentId === u.id))
export function toggleItem(sessionId, actorRole, itemId) {
  const s = state.sessions.find(x => x.id === sessionId), it = s && s.items.find(i => i.id === itemId)
  if (!it) return 'Action item not found.'
  if (it.assignee !== actorRole) return `Only the ${it.assignee} can mark this item.`
  it.done = !it.done; return null
}
