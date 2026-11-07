<template>
  <div v-if="user" class="shell">
    <header class="shell-top">
      <router-link class="shell-brand" :to="'/' + user.role + '/dashboard'"><Icon name="compass" :size="26" />MentorConnect</router-link>
      <div class="row">
        <span class="chip"><Avatar :name="user.name" :photo="user.photo" :size="24" />{{ user.name }} · {{ roleLabel }}</span>
        <router-link to="/notifications" class="chip" :aria-label="'Notifications' + (unread ? ', ' + unread + ' unread' : '')"><Icon name="bell" :size="16" />{{ unread ? unread + ' new' : 'Alerts' }}</router-link>
      </div>
    </header>

    <section class="frame" :class="{ compact }" aria-label="Workspace">
      <div class="frame-bar"><span>{{ section }}</span>
        <button class="barbtn" type="button" :aria-expanded="!compact" aria-controls="side" @click="toggleSide"><Icon name="dashboard" :size="14" /> {{ compact ? 'Show panel' : 'Hide panel' }}</button></div>
      <div class="frame-body">
        <aside v-show="!compact" id="side" class="frame-side" aria-label="Context and shortcuts">
          <div class="side-id"><Avatar :name="user.name" :photo="user.photo" :size="34" /><div><b>{{ user.name.split(' ')[0] }}</b><span class="muted">{{ roleLabel }}</span></div></div>
          <h3 class="side-h">Shortcuts</h3>
          <ul class="qa"><li v-for="q in quick" :key="q[0]"><router-link :to="q[0]"><Icon :name="q[2]" :size="16" /><span>{{ q[1] }}</span><span v-if="q[3]" class="qc">{{ q[3] }}</span></router-link></li></ul>
          <h3 class="side-h">Status</h3>
          <template v-if="user.role === 'student'"><p>Pending requests: <b>{{ pend }} / 3</b></p><div class="bar side-bar"><i :style="{ width: pend / 3 * 100 + '%' }"></i></div></template>
          <template v-if="user.role === 'mentor'"><p>Mentees: <b>{{ mentees }} / {{ user.capacity }}</b></p><div class="bar side-bar"><i :style="{ width: Math.min(100, mentees / user.capacity * 100) + '%' }"></i></div><p class="sidehint">{{ user.paused ? 'New requests are paused.' : 'Accepting requests.' }}</p></template>
          <p v-if="user.role === 'coordinator'" class="sidehint">Students are anonymised until matched.</p>
          <p v-if="user.role === 'mentor' && !user.verified" class="sidehint"><b>Awaiting verification.</b> Students cannot find you yet.</p>
          <p v-if="user.role === 'admin'" class="sidehint">Aggregate figures only.</p>
          <button class="btn ghost sm" style="margin-top:12px" @click="out"><Icon name="logout" :size="15" /> Sign out</button>
        </aside>
        <main class="frame-main" id="main" tabindex="-1"><div class="content"><router-view :key="$route.fullPath" /></div></main>
      </div>
    </section>

    <nav class="vnav" aria-label="Main navigation">
      <router-link v-for="n in nav" :key="n[0]" :to="n[0]" :class="{ on: isOn(n[0]) }" :aria-current="isOn(n[0]) ? 'page' : null" active-class="" exact-active-class=""><Icon :name="n[2]" :size="22" /><span>{{ n[1] }}</span><span v-if="n[1] === 'Notifications' && unread" class="dot">{{ unread }}<span class="sr"> unread</span></span></router-link>
      <router-link to="/notifications" :class="{ on: route.path === '/notifications' }" :aria-current="route.path === '/notifications' ? 'page' : null" active-class="" exact-active-class=""><Icon name="bell" :size="22" /><span>Alerts</span><span v-if="unread" class="dot">{{ unread }}<span class="sr"> unread</span></span></router-link>
    </nav>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { me, state, logout, activeMentees, pendingOf, stuckRequests, unmatchedStudents } from '../composables/useStore'
import Icon from '../components/Icon.vue'
import Avatar from '../components/Avatar.vue'
const router = useRouter(), route = useRoute(), user = computed(me)
const NAV = {
  student: [['/student/dashboard', 'Home', 'dashboard'], ['/student/mentors', 'Mentors', 'search'], ['/student/requests', 'Requests', 'send'], ['/student/goals', 'Goals', 'target'], ['/student/sessions', 'Sessions', 'calendar'], ['/student/feedback', 'Feedback', 'star'], ['/student/profile', 'Profile', 'user'], ['/account', 'Account', 'settings']],
  mentor: [['/mentor/dashboard', 'Home', 'dashboard'], ['/mentor/requests', 'Requests', 'inbox'], ['/mentor/mentees', 'Mentees', 'users'], ['/mentor/sessions', 'Sessions', 'calendar'], ['/mentor/availability', 'Availability', 'clock'], ['/mentor/feedback', 'Feedback', 'star'], ['/mentor/profile', 'Profile', 'user'], ['/account', 'Account', 'settings']],
  coordinator: [['/coordinator/dashboard', 'Insights', 'chart'], ['/coordinator/matching', 'Matching', 'users'], ['/coordinator/goals', 'Goals', 'target'], ['/coordinator/profile', 'Profile', 'user'], ['/account', 'Account', 'settings']],
  admin: [['/admin/dashboard', 'Overview', 'chart'], ['/admin/dashboard?tab=users', 'Users', 'users'], ['/admin/dashboard?tab=content', 'Content', 'clipboard'], ['/admin/dashboard?tab=reports', 'Reports', 'shield']]
}
const roleLabel = computed(() => ({ student: 'Student', mentor: 'Mentor', coordinator: 'Coordinator', admin: 'Administrator' }[user.value?.role]))
const nav = computed(() => (user.value ? NAV[user.value.role] : []))
const section = computed(() => { const p = route.path; const hit = nav.value.find(n => n[0] === p + (route.query.tab ? '?tab=' + route.query.tab : '')) || nav.value.find(n => n[0].split('?')[0] === p); return hit ? hit[1] : p.startsWith('/notifications') ? 'Notifications' : 'Workspace' })
const unread = computed(() => (user.value ? state.notifications.filter(n => n.userId === user.value.id && !n.read).length : 0))
const pend = computed(() => (user.value ? pendingOf(user.value.id).length : 0))
const mentees = computed(() => (user.value ? activeMentees(user.value.id).length : 0))
const compact = ref((() => { try { const v = localStorage.getItem('mc_side'); return v === null ? window.innerWidth < 1000 : v === '1' } catch (e) { return false } })())
const toggleSide = () => { compact.value = !compact.value; try { localStorage.setItem('mc_side', compact.value ? '1' : '0') } catch (e) { /* storage unavailable */ } }
const quick = computed(() => {
  const r = user.value.role, id = user.value.id
  if (r === 'student') return [['/student/mentors', 'Find a mentor', 'search'], ['/student/requests', 'My requests', 'send', pend.value], ['/student/goals', 'Update goals', 'target'], ['/student/sessions', 'Request a session', 'calendar']]
  if (r === 'mentor') return [['/mentor/requests', 'Review requests', 'inbox', state.requests.filter(x => x.mentorId === id && x.status === 'pending').length], ['/mentor/availability', 'Add availability', 'clock'], ['/mentor/sessions', 'Log a session', 'calendar'], ['/mentor/profile', 'Edit profile', 'user']]
  if (r === 'coordinator') return [['/coordinator/matching', 'Match students', 'users', unmatchedStudents().length], ['/coordinator/dashboard', 'Stuck requests', 'clock', stuckRequests().length], ['/coordinator/goals', 'Open goals', 'target']]
  return [['/admin/dashboard?tab=users', 'Verify mentors', 'users', state.users.filter(x => x.role === 'mentor' && x.title && !x.verified).length], ['/admin/dashboard?tab=reports', 'Review reports', 'shield', state.reports.filter(x => x.status !== 'resolved').length], ['/admin/dashboard?tab=content', 'Manage tags', 'clipboard', state.tags.filter(x => x.status === 'suggested').length]]
})
const isOn = to => { const [p, q] = to.split('?'); return route.path === p && (q ? route.fullPath === to : !route.query.tab) }
const out = async () => { await router.push('/login'); logout() }
</script>
