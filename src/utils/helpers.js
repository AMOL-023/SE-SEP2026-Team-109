export const emailOk = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
// Student rule (Milestone 1, US-01): email must end with study.iitm.ac.in (ds., es., etc.)
export const iitmOk = e => /@([\w-]+\.)*study\.iitm\.ac\.in$/i.test(e.trim())
export const passOk = p => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p)
export const fmt = t => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
export const home = role => `/${role}/dashboard`
export const list = s => [...new Set(s.split(',').map(x => x.trim()).filter(Boolean))]
