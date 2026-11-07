// Fictional demo data. All passwords for seeded accounts: Demo1234
const DAY = 864e5, HOUR = 36e5, d = n => Date.now() - n * DAY, PW = 'Demo1234'
const at = (days, hour) => { const t = new Date(Date.now() + days * DAY); t.setHours(hour, 0, 0, 0); return t.getTime() }
const req = (id, studentId, mentorId, status, age, message, reason = '') => ({
  id, studentId, mentorId, status, message, reason, createdAt: d(age), expiresAt: d(age) + 14 * DAY,
  history: [{ from: null, to: 'pending', actor: 'Student', at: d(age) },
    ...(status === 'pending' ? [] : [{ from: 'pending', to: status, actor: status === 'expired' ? 'System' : 'Mentor', at: d(age - 2) }])]
})
const sk = (...a) => a.map(([name, level, want]) => ({ name, level, want: !!want }))
const st = (id, name, email, programme, interests, needs, skills) => ({ id, role: 'student', name, email, password: PW, programme, interests, needs, skills })
const mt = (id, name, email, title, company, years, industry, bio, expertise, support, capacity, paused = false, verified = true) =>
  ({ id, role: 'mentor', name, email, password: PW, title, company, years, industry, bio, expertise, support, capacity, paused, verified })
const g = (id, studentId, title, target, status, visibility = 'me', tags = [], description = '') => ({ id, studentId, title, description, target, status, visibility, tags })
const EXTRA = {
  a1: { username: 'programme_admin' }, c1: { username: 'kavya_reddy', todos: [{ id: 't1', text: 'Review stalled requests', done: false }] },
  s1: { username: 'aarav_s', degree: 'DS', rollNo: '24f1002112' }, s2: { username: 'meera_i', degree: 'DS' }, s3: { username: 'rohan_d', degree: 'ES' }, s4: { username: 'sneha_p', degree: 'DS' }, s5: { username: 'karthik_r', degree: 'Management' },
  m1: { username: 'priya_nair', careerArea: 'Data Science', industry: 'Fintech' }, m2: { username: 'rahul_menon', careerArea: 'Software Engineering', industry: 'Cloud' }, m3: { username: 'ananya_rao', careerArea: 'Product Management', industry: 'Consumer' },
  m4: { username: 'vikram_seth', careerArea: 'Research', industry: 'Academia' }, m5: { username: 'neha_k', careerArea: 'Analytics', industry: 'Finance' }, m6: { username: 'arjun_bhat', careerArea: 'Entrepreneurship', industry: 'EdTech' }, m7: { username: 'isha_verma', careerArea: 'Data Science', industry: 'AI' }
}
export const seed = () => ({
  sessionId: null,
  users: ([
    { id: 'a1', role: 'admin', name: 'Programme Admin', email: 'admin@mentorconnect.demo', password: PW },
    { id: 'c1', role: 'coordinator', name: 'Kavya Reddy', email: 'coordinator@mentorconnect.demo', password: PW },
    st('s1', 'Aarav Sharma', 'student@mentorconnect.demo', 'BS Degree', ['Data Science', 'Product Management'], 'Unsure whether to pursue a data role or higher studies; need help building a portfolio while working full time.', sk(['Python', 3], ['SQL', 2, true], ['Statistics', 2, true])),
    st('s2', 'Meera Iyer', 'meera.iyer@ds.study.iitm.ac.in', 'BSc', ['Data Science'], 'Wants to move from support work into analytics.', sk(['Excel', 4], ['Statistics', 2, true])),
    st('s3', 'Rohan Das', 'rohan.das@es.study.iitm.ac.in', 'Diploma', ['Software Engineering'], 'Looking for backend internship guidance.', sk(['Java', 3], ['Git', 3])),
    st('s4', 'Sneha Patil', 'sneha.patil@ds.study.iitm.ac.in', 'BS Degree', ['Research', 'Higher Studies'], 'Considering a masters abroad and needs an honest view of the process.', sk(['Python', 4], ['ML', 3, true])),
    st('s5', 'Karthik R', 'karthik.r@ds.study.iitm.ac.in', 'Foundation', ['Entrepreneurship'], 'Has a startup idea and no network.', sk(['Design', 2])),
    mt('m1', 'Priya Nair', 'mentor@mentorconnect.demo', 'Senior Data Scientist', 'Finlytics', 7, 'Data Science', 'Moved from a non-CS role into data science through the IITM BS programme. Happy to review resumes and portfolios.', ['Data Science', 'Machine Learning', 'Career Switch'], ['Resume review', 'Mock interviews', 'Career advice'], 3),
    mt('m2', 'Rahul Menon', 'rahul.menon@alumni.demo', 'Backend Engineer', 'CloudNine Labs', 5, 'Software', 'Backend developer, working on distributed systems. Can guide on internships and system design basics.', ['Backend', 'System Design', 'Internships'], ['Mock interviews', 'Project guidance'], 1),
    mt('m3', 'Ananya Rao', 'ananya.rao@alumni.demo', 'Product Manager', 'Greenleaf', 6, 'Product', 'Product manager who started in QA. Can talk about the path into product roles.', ['Product Management', 'Career Switch'], ['Career advice', 'Resume review'], 2),
    mt('m4', 'Dr. Vikram Seth', 'vikram.seth@alumni.demo', 'PhD Researcher', 'Univ. of Edinburgh', 4, 'Research', 'Doing a PhD in NLP. Guidance on applications and research proposals.', ['Higher Studies', 'Research', 'NLP'], ['Application review', 'Career advice'], 4, true),
    mt('m5', 'Neha Kulkarni', 'neha.kulkarni@alumni.demo', 'Analytics Lead', 'Ledgerly', 8, 'Finance', 'Leads an analytics team in fintech. Can help with analyst-to-lead transitions.', ['Data Analytics', 'Finance', 'Leadership'], ['Career advice', 'Mock interviews'], 3),
    mt('m6', 'Arjun Bhat', 'arjun.bhat@alumni.demo', 'Founder', 'Tinkerbench', 5, 'Entrepreneurship', 'Founded a hardware-education startup after graduating.', ['Entrepreneurship', 'Fundraising'], ['Career advice', 'Project guidance'], 2),
    mt('m7', 'Isha Verma', 'isha.verma@alumni.demo', 'ML Engineer', 'Vectorly', 3, 'Data Science', 'Applied ML engineer. Awaiting admin verification, so not yet visible to students.', ['Machine Learning', 'Data Science'], ['Project guidance'], 2, false, false)
  ]).map(u => ({ ...u, ...(EXTRA[u.id] || {}) })),
  requests: [
    req('r1', 's1', 'm1', 'pending', 2, 'Hello Priya, I work full time in operations and want to move into data science. Could you guide me on building a portfolio?'),
    req('r2', 's4', 'm1', 'pending', 1, 'I am considering a masters in ML abroad and would value your perspective on how to decide between work and study.'),
    req('r3', 's2', 'm1', 'accepted', 20, 'I am in customer support and want to move into analytics. Could you review my learning plan and resume?'),
    req('r4', 's3', 'm2', 'accepted', 15, 'I am a diploma student targeting backend internships and need help with a project roadmap and interview prep.'),
    req('r5', 's1', 'm3', 'rejected', 8, 'Hi Ananya, I would like to understand how to move from operations into product management and what skills matter.', 'My calendar is full this quarter. Please try a mentor with Data Science expertise.'),
    req('r6', 's1', 'm4', 'pending', 15, 'Dr. Seth, I am exploring research and would like feedback on how to prepare for PhD applications in the next two years.'),
    req('r7', 's5', 'm2', 'pending', 9, 'I have a startup idea and no network. I would like to learn how backend engineers evaluate early-stage products.')
  ],
  mentorships: [{ id: 'ms1', studentId: 's2', mentorId: 'm1', active: true, since: d(18) }, { id: 'ms2', studentId: 's3', mentorId: 'm2', active: true, since: d(13) }],
  goals: [
    g('g1', 's1', 'Finish SQL joins practice', '2026-11-15', 'doing', 'all', ['SQL', 'Data Science']),
    g('g2', 's1', 'Publish first data project on GitHub', '2026-12-10', 'todo', 'mentor', ['Portfolio']),
    g('g3', 's1', 'Update resume', '2026-11-05', 'done', 'me', ['Resume']),
    g('g4', 's2', 'Complete statistics course', '2026-12-01', 'doing', 'mentor', ['Statistics']),
    g('g5', 's2', 'Build a dashboard from public data', '2026-12-20', 'todo', 'mentor', ['Data Analytics']),
    g('g6', 's4', 'Shortlist five masters programmes', '2026-12-05', 'todo', 'all', ['Higher Studies'])
  ],
  availability: [
    { id: 'av1', mentorId: 'm1', start: at(2, 18), end: at(2, 19), status: 'open', sessionId: null },
    { id: 'av2', mentorId: 'm1', start: at(4, 10), end: at(4, 11), status: 'booked', sessionId: 'se1' },
    { id: 'av3', mentorId: 'm1', start: at(6, 17), end: at(6, 18), status: 'open', sessionId: null },
    { id: 'av4', mentorId: 'm2', start: at(3, 19), end: at(3, 20), status: 'pending', sessionId: 'se4' },
    { id: 'av5', mentorId: 'm2', start: at(5, 19), end: at(5, 20), status: 'open', sessionId: null }
  ],
  sessions: [
    { id: 'se1', mentorshipId: 'ms1', mentorId: 'm1', studentId: 's2', slotId: 'av2', start: at(4, 10), end: at(4, 11), status: 'scheduled', notes: '', items: [] },
    { id: 'se2', mentorshipId: 'ms1', mentorId: 'm1', studentId: 's2', slotId: null, start: at(-7, 18), end: at(-7, 19), status: 'completed', notes: 'Reviewed the learning plan and agreed to focus on statistics first, then a small public-data dashboard.',
      items: [{ id: 'ai1', text: 'Finish the descriptive statistics module', done: true, assignee: 'student', createdBy: 'm1' }, { id: 'ai2', text: 'Share two example dashboards to emulate', done: false, assignee: 'mentor', createdBy: 'm1' }] },
    { id: 'se4', mentorshipId: 'ms2', mentorId: 'm2', studentId: 's3', slotId: 'av4', start: at(3, 19), end: at(3, 20), status: 'requested', notes: '', items: [] },
    { id: 'se3', mentorshipId: 'ms2', mentorId: 'm2', studentId: 's3', slotId: null, start: at(-3, 19), end: at(-3, 20), status: 'scheduled', notes: '', items: [] }
  ],
  feedback: [
    { id: 'f1', mentorshipId: 'ms1', sessionId: 'se2', fromId: 's2', toId: 'm1', kind: 'session', scores: { Communication: 5, Helpfulness: 4, Preparedness: 5 }, comments: 'Very clear guidance and quick replies.', isPublic: false, createdAt: d(5) }
  ],
  criteria: ['Communication', 'Helpfulness', 'Preparedness'],
  platformFeedback: [{ id: 'pf1', text: 'The request limit is a good idea. I would like reminders before a request expires.', at: d(4) }, { id: 'pf2', text: 'Mentor search is easy to use on my phone.', at: d(2) }],
  tags: ['Data Science', 'Machine Learning', 'Career Switch', 'Backend', 'System Design', 'Internships', 'Product Management', 'Higher Studies', 'Research', 'NLP', 'Data Analytics', 'Finance', 'Leadership', 'Entrepreneurship', 'Fundraising']
    .map((name, i) => ({ id: 't' + i, name, status: 'approved' })).concat([{ id: 'ts1', name: 'Data science', status: 'suggested' }, { id: 'ts2', name: 'UX Design', status: 'suggested' }]),
  groups: { c1: ['ms1'] },
  messages: [],
  audit: [{ id: 'au1', at: d(9), actor: 'Programme Admin', text: 'Verified mentor Priya Nair' }],
  notifications: [
    { id: 'n1', userId: 's1', text: 'Ananya Rao rejected your request', link: '/student/requests', read: false, at: d(6) },
    { id: 'n2', userId: 'm1', text: 'New mentoring request from Aarav Sharma', link: '/mentor/requests/r1', read: false, at: d(2) },
    { id: 'n3', userId: 'm1', text: 'New mentoring request from Sneha Patil', link: '/mentor/requests/r2', read: false, at: d(1) },
    { id: 'n4', userId: 'a1', text: 'Mentor Isha Verma is waiting for verification', link: '/admin/dashboard?tab=users', read: false, at: d(1) }
  ],
  reports: [
    { id: 'rp1', reporterId: 's3', reportedId: 'm2', category: 'Mentor stopped replying', description: 'My mentor accepted my request three weeks ago but has not answered my last two messages.', evidence: '', status: 'open', action: '', createdAt: d(3) },
    { id: 'rp2', reporterId: 'm1', reportedId: 's4', category: 'Repeated off-topic messages', description: 'The student keeps asking for job referrals, which is outside the support I offer.', evidence: 'chat-screenshot.png', status: 'review', action: '', createdAt: d(5) }
  ]
})
