// Aggregate-only figures shared by the coordinator and admin views. No names, emails or message content.
import { state, openSlots, live, DAY } from '../composables/useStore'
const match = (a, m) => [...m.expertise, m.industry].some(x => x.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(x.toLowerCase()))
export const students = () => state.users.filter(u => u.role === 'student' && live(u))
export const verifiedMentors = () => state.users.filter(u => u.role === 'mentor' && u.title && u.verified && live(u))
export const reqCount = s => state.requests.filter(r => r.status === s).length
export function supplyDemand() {
  const st = students(), ms = verifiedMentors()
  return [...new Set(st.flatMap(s => s.interests))].map(a => ({ a, demand: st.filter(s => s.interests.includes(a)).length, supply: ms.filter(m => match(a, m)).reduce((t, m) => t + openSlots(m), 0) }))
    .sort((x, y) => (y.demand - y.supply) - (x.demand - x.supply))
}
export const acceptRate = () => { const a = reqCount('accepted'), t = a + reqCount('rejected'); return t ? Math.round(a / t * 100) + '%' : 'n/a' }
export const weeklyRequests = () => [3, 2, 1, 0].map(w => ({ label: w ? w + 'w ago' : 'This week', n: state.requests.filter(r => { const a = (Date.now() - r.createdAt) / DAY; return a >= w * 7 && a < (w + 1) * 7 }).length }))
export const mentorsWithRoom = () => verifiedMentors().filter(m => openSlots(m) > 0).length
