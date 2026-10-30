// Fictional demo data. All passwords for seeded accounts: Demo1234
const DAY = 864e5, d = n => Date.now() - n * DAY, PW = 'Demo1234'
const req = (id, studentId, mentorId, status, age, message, reason = '') => ({
  id, studentId, mentorId, status, message, reason, createdAt: d(age), expiresAt: d(age) + 14 * DAY,
  history: [{ from: null, to: 'pending', actor: 'Student', at: d(age) },
    ...(status === 'pending' ? [] : [{ from: 'pending', to: status, actor: status === 'expired' ? 'System' : 'Mentor', at: d(age - 2) }])]
})
const st = (id, name, email, programme, interests, needs, skills) => ({ id, role: 'student', name, email, password: PW, programme, interests, needs, skills })
const mt = (id, name, email, title, company, years, industry, bio, expertise, support, capacity, paused = false) =>
  ({ id, role: 'mentor', name, email, password: PW, title, company, years, industry, bio, expertise, support, capacity, paused })
export const seed = () => ({
  sessionId: null,
  users: [
    { id: 'a1', role: 'admin', name: 'Programme Admin', email: 'admin@mentorconnect.demo', password: PW },
    st('s1', 'Aarav Sharma', 'student@mentorconnect.demo', 'BS Degree', ['Data Science', 'Product Management'], 'Unsure whether to pursue a data role or higher studies; need help building a portfolio while working full time.', ['Python', 'SQL']),
    st('s2', 'Meera Iyer', 'meera.iyer@ds.study.iitm.ac.in', 'BSc', ['Data Science'], 'Wants to move from support work into analytics.', ['Excel', 'Statistics']),
    st('s3', 'Rohan Das', 'rohan.das@es.study.iitm.ac.in', 'Diploma', ['Software Engineering'], 'Looking for backend internship guidance.', ['Java', 'Git']),
    st('s4', 'Sneha Patil', 'sneha.patil@ds.study.iitm.ac.in', 'BS Degree', ['Research', 'Higher Studies'], 'Considering a masters abroad and needs an honest view of the process.', ['Python', 'ML']),
    st('s5', 'Karthik R', 'karthik.r@ds.study.iitm.ac.in', 'Foundation', ['Entrepreneurship'], 'Has a startup idea and no network.', ['Design']),
    mt('m1', 'Priya Nair', 'mentor@mentorconnect.demo', 'Senior Data Scientist', 'Finlytics', 7, 'Data Science', 'Moved from a non-CS role into data science through the IITM BS programme. Happy to review resumes and portfolios.', ['Data Science', 'Machine Learning', 'Career Switch'], ['Resume review', 'Mock interviews', 'Career advice'], 3),
    mt('m2', 'Rahul Menon', 'rahul.menon@alumni.demo', 'Backend Engineer', 'CloudNine Labs', 5, 'Software', 'Backend developer, working on distributed systems. Can guide on internships and system design basics.', ['Backend', 'System Design', 'Internships'], ['Mock interviews', 'Project guidance'], 1),
    mt('m3', 'Ananya Rao', 'ananya.rao@alumni.demo', 'Product Manager', 'Greenleaf', 6, 'Product', 'Product manager who started in QA. Can talk about the path into product roles.', ['Product Management', 'Career Switch'], ['Career advice', 'Resume review'], 2),
    mt('m4', 'Dr. Vikram Seth', 'vikram.seth@alumni.demo', 'PhD Researcher', 'Univ. of Edinburgh', 4, 'Research', 'Doing a PhD in NLP. Guidance on applications and research proposals.', ['Higher Studies', 'Research', 'NLP'], ['Application review', 'Career advice'], 4, true),
    mt('m5', 'Neha Kulkarni', 'neha.kulkarni@alumni.demo', 'Analytics Lead', 'Ledgerly', 8, 'Finance', 'Leads an analytics team in fintech. Can help with analyst-to-lead transitions.', ['Data Analytics', 'Finance', 'Leadership'], ['Career advice', 'Mock interviews'], 3),
    mt('m6', 'Arjun Bhat', 'arjun.bhat@alumni.demo', 'Founder', 'Tinkerbench', 5, 'Entrepreneurship', 'Founded a hardware-education startup after graduating.', ['Entrepreneurship', 'Fundraising'], ['Career advice', 'Project guidance'], 2)
  ],
  requests: [
    req('r1', 's1', 'm1', 'pending', 2, 'Hello Priya, I work full time in operations and want to move into data science. Could you guide me on building a portfolio?'),
    req('r2', 's4', 'm1', 'pending', 1, 'I am considering a masters in ML abroad and would value your perspective on how to decide between work and study.'),
    req('r3', 's2', 'm1', 'accepted', 20, 'I am in customer support and want to move into analytics. Could you review my learning plan and resume?'),
    req('r4', 's3', 'm2', 'accepted', 15, 'I am a diploma student targeting backend internships and need help with a project roadmap and interview prep.'),
    req('r5', 's1', 'm3', 'rejected', 8, 'Hi Ananya, I would like to understand how to move from operations into product management and what skills matter.', 'My calendar is full this quarter. Please try a mentor with Data Science expertise.'),
    req('r6', 's1', 'm4', 'pending', 15, 'Dr. Seth, I am exploring research and would like feedback on how to prepare for PhD applications in the next two years.'),
    req('r7', 's5', 'm2', 'pending', 3, 'I have a startup idea and no network. I would like to learn how backend engineers evaluate early-stage products.')
  ],
  mentorships: [{ id: 'ms1', studentId: 's2', mentorId: 'm1', active: true, since: d(18) }, { id: 'ms2', studentId: 's3', mentorId: 'm2', active: true, since: d(13) }],
  goals: [
    { id: 'g1', studentId: 's1', title: 'Finish SQL joins practice', target: '2026-11-15', status: 'doing' },
    { id: 'g2', studentId: 's1', title: 'Publish first data project on GitHub', target: '2026-12-10', status: 'todo' },
    { id: 'g3', studentId: 's1', title: 'Update resume', target: '2026-11-05', status: 'done' },
    { id: 'g4', studentId: 's2', title: 'Complete statistics course', target: '2026-12-01', status: 'doing' },
    { id: 'g5', studentId: 's2', title: 'Build a dashboard from public data', target: '2026-12-20', status: 'todo' }
  ],
  notifications: [
    { id: 'n1', userId: 's1', text: 'Ananya Rao rejected your request', link: '/student/requests', read: false, at: d(6) },
    { id: 'n2', userId: 'm1', text: 'New mentoring request from Aarav Sharma', link: '/mentor/requests/r1', read: false, at: d(2) },
    { id: 'n3', userId: 'm1', text: 'New mentoring request from Sneha Patil', link: '/mentor/requests/r2', read: false, at: d(1) }
  ]
})
