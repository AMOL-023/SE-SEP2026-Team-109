import { createRouter, createWebHashHistory } from 'vue-router'
import { me, runExpiry } from '../composables/useStore'
import { home } from '../utils/helpers'
const S = ['student'], M = ['mentor'], A = ['admin'], C = ['coordinator'], ALL = ['student', 'mentor', 'admin', 'coordinator']
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('../pages/auth/LoginPage.vue'), meta: { public: true } },
  { path: '/register', component: () => import('../pages/auth/RegisterPage.vue'), meta: { public: true } },
  { path: '/register/success', component: () => import('../pages/auth/RegisterSuccessPage.vue'), meta: { public: true } },
  { path: '/', component: () => import('../layouts/AppLayout.vue'), children: [
    { path: 'student/dashboard', component: () => import('../pages/student/StudentDashboardPage.vue'), meta: { roles: S } },
    { path: 'student/profile', component: () => import('../pages/student/StudentProfilePage.vue'), meta: { roles: S } },
    { path: 'student/mentors', component: () => import('../pages/student/MentorDirectoryPage.vue'), meta: { roles: S } },
    { path: 'student/mentors/:mentorId', component: () => import('../pages/student/MentorDetailsPage.vue'), meta: { roles: S } },
    { path: 'student/mentors/:mentorId/request', component: () => import('../pages/student/MentoringRequestPage.vue'), meta: { roles: S } },
    { path: 'student/requests', component: () => import('../pages/student/StudentRequestsPage.vue'), meta: { roles: S } },
    { path: 'student/goals', component: () => import('../pages/student/CareerGoalsPage.vue'), meta: { roles: S } },
    { path: 'mentor/dashboard', component: () => import('../pages/mentor/MentorDashboardPage.vue'), meta: { roles: M } },
    { path: 'mentor/profile', component: () => import('../pages/mentor/MentorProfilePage.vue'), meta: { roles: M } },
    { path: 'mentor/requests', component: () => import('../pages/mentor/IncomingRequestsPage.vue'), meta: { roles: M } },
    { path: 'mentor/requests/:requestId', component: () => import('../pages/mentor/RequestReviewPage.vue'), meta: { roles: M } },
    { path: 'mentor/mentees', component: () => import('../pages/mentor/MyMenteesPage.vue'), meta: { roles: M } },
    { path: 'student/sessions', component: () => import('../pages/shared/SessionsPage.vue'), meta: { roles: S } },
    { path: 'student/feedback', component: () => import('../pages/shared/FeedbackPage.vue'), meta: { roles: S } },
    { path: 'mentor/sessions', component: () => import('../pages/shared/SessionsPage.vue'), meta: { roles: M } },
    { path: 'mentor/availability', component: () => import('../pages/mentor/AvailabilityPage.vue'), meta: { roles: M } },
    { path: 'mentor/feedback', component: () => import('../pages/shared/FeedbackPage.vue'), meta: { roles: M } },
    { path: 'coordinator/dashboard', component: () => import('../pages/coordinator/CoordinatorDashboardPage.vue'), meta: { roles: C } },
    { path: 'coordinator/matching', component: () => import('../pages/coordinator/CoordinatorMatchingPage.vue'), meta: { roles: C } },
    { path: 'coordinator/goals', component: () => import('../pages/coordinator/CoordinatorGoalsPage.vue'), meta: { roles: C } },
    { path: 'account', component: () => import('../pages/shared/AccountPage.vue'), meta: { roles: ALL } },
    { path: 'notifications', component: () => import('../pages/shared/NotificationsPage.vue'), meta: { roles: ALL } },
    { path: 'admin/dashboard', component: () => import('../pages/admin/AdminDashboardPage.vue'), meta: { roles: A } }
  ] },
  { path: '/:rest(.*)*', component: () => import('../pages/shared/NotFoundPage.vue'), meta: { public: true } }
]
const router = createRouter({ history: createWebHashHistory(), routes })
// Demo-only guard: real access control must be enforced by the backend.
router.beforeEach(to => {
  runExpiry()
  const u = me()
  if (to.meta.public) return true
  if (!u) return '/login'
  if (to.meta.roles && !to.meta.roles.includes(u.role)) return home(u.role)
  return true
})
export default router
