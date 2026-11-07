export const emailOk = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
// Student rule (Milestone 1, US-01): email must end with study.iitm.ac.in (ds., es., etc.)
export const iitmOk = e => /@([\w-]+\.)*study\.iitm\.ac\.in$/i.test(e.trim())
export const passOk = p => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p)
export const fmt = t => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
export const home = role => `/${role}/dashboard`
export const list = s => [...new Set(s.split(',').map(x => x.trim()).filter(Boolean))]
export const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }
export const DEGREES = ['ES', 'DS', 'Aero', 'Management']
export const CAREER_AREAS = ['Data Science', 'Software Engineering', 'Product Management', 'Research', 'Analytics', 'Entrepreneurship', 'Finance']
// Shrinks a chosen photo to a small JPEG data URL so it is cheap to keep in the browser (mock) store.
export const resizeImage = (file, max = 200) => new Promise((resolve, reject) => {
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return reject(new Error('Choose a PNG, JPG or WebP image.'))
  if (file.size > 5e6) return reject(new Error('The image must be smaller than 5 MB.'))
  const rd = new FileReader()
  rd.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); resolve(c.toDataURL('image/jpeg', 0.8)) }; img.onerror = () => reject(new Error('That file is not a readable image.')); img.src = rd.result }
  rd.readAsDataURL(file)
})
