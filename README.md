# MentorConnect: Student Mentoring and Career Support Platform (Frontend, Milestone 2)

Vue 3 + Vite + Vue Router frontend using **mock data only** (no backend, database or API calls).

## Prerequisites
Node.js 18 or newer and npm.

## Install, run, build
```bash
npm install
npm run dev      # open the URL printed by Vite, usually http://localhost:5173
npm run build    # production build into dist/
```

## Demo accounts (password for all: `Demo1234`)
| Role | Email |
|---|---|
| Student | student@mentorconnect.demo |
| Mentor | mentor@mentorconnect.demo |
| Admin | admin@mentorconnect.demo |

New accounts can be registered. Students need an email ending in `study.iitm.ac.in` (ds., es. etc.). Mentors can use any valid email.

## Routes
`/login`, `/register`, `/register/success`, `/student/dashboard`, `/student/profile`, `/student/mentors`, `/student/mentors/:mentorId`, `/student/mentors/:mentorId/request`, `/student/requests`, `/student/goals`, `/mentor/dashboard`, `/mentor/profile`, `/mentor/requests`, `/mentor/requests/:requestId`, `/mentor/mentees`, `/notifications`, `/admin/dashboard`.

## User story coverage
| Story | Page | Frontend behaviour |
|---|---|---|
| US-01 | Login, Register | Validation, role-based redirect, route guards |
| US-02 | Student profile | Create/edit, completion bar, mentors see email only after accept |
| US-03 | Mentor profile | Up to 6 expertise areas, support types, visible to students once complete |
| US-04 | Mentor dashboard | Capacity 1 to 10, pause toggle, "No open slots" disables request button |
| US-05 | Find Mentors | Search, industry/expertise filters, open-slots filter, paused badge, empty state |
| US-06 | Request form | 50 to 1500 characters, max 3 pending, capacity check, 14-day expiry date |
| US-07 | My Requests | Status tabs, history timeline, withdraw |
| US-08 | Request review | Accept/reject with confirmation, optional 500-character reason, no reverting, email revealed on accept |
| US-09 | Any page load | Mock expiry marks overdue pending requests as Expired by "System" |
| US-10 | Career Goals | Kanban, past dates blocked, mentor view read-only |
| US-11 | Admin dashboard | Aggregate counts, no message content |
| US-13 | Notifications | Unread count, mark read, mark all read, links to related page |
| Admin extra | Admin dashboard | User search and deactivate/reactivate (assumption, not a Milestone 1 story) |
| **Not built yet** | | US-12 sessions, US-14 account deletion, US-15 reports, US-16 availability (planned for Sprint 2) |

## Mock data and state
`src/data/mock.js` holds seed data. `src/composables/useStore.js` holds shared reactive state and all workflow rules, so a change on one page appears on the others. State is saved in `localStorage`. To reset the demo, run `localStorage.removeItem('mentorconnect_demo_v1')` in the browser console and reload.

## Folder structure
`src/pages` (by role), `src/layouts`, `src/components`, `src/composables`, `src/data`, `src/router`, `src/utils`, `src/assets/styles.css`.

## Frontend-only limitations
No backend, database, real authentication or server-side authorization. Route guards and passwords in localStorage are for demonstration only and are not secure. No email verification, no server scheduler (expiry runs in the browser), no API integration. Backend calls can later replace the functions in `useStore.js`.
