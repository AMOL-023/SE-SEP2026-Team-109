<template>
  <header class="greet"><p class="eyebrow">Programme operations</p><h1>{{ titles[tab] || 'Programme overview' }}</h1></header>
  <nav class="tabs" aria-label="Sections"><router-link v-for="t in tabs" :key="t[0]" :to="t[0] === 'overview' ? '/admin/dashboard' : '/admin/dashboard?tab=' + t[0]" class="tablink" :class="{ on: tab === t[0] }">{{ t[1] }}<span v-if="t[0] === 'reports' && openReports" class="dot">{{ openReports }}</span></router-link></nav>
  <template v-if="tab === 'overview'">
    <section class="card figures" aria-label="Programme figures"><div><b>{{ n('student') }}</b><span class="muted">Students</span></div><div><b>{{ n('mentor') }}</b><span class="muted">Mentors · {{ state.users.filter(u => u.role === 'mentor' && u.verified && live(u).length }} verified</span></div>
      <div><b>{{ state.mentorships.filter(m => m.active).length }}</b><span class="muted">Active mentorships</span></div><div><b>{{ rc('pending') }}</b><span class="muted">Pending requests · {{ rate }} accepted</span></div></section>
    <div class="ws adm">
      <div class="col-main">
        <section class="card" aria-labelledby="at"><h2 id="at">Needs attention</h2>
          <ul class="attn"><li v-for="a in attention" :key="a.t" :class="{ warn: a.n > 0 }"><span class="cnt">{{ a.n }}</span><span><b>{{ a.t }}</b><br /><span class="muted">{{ a.d }}</span></span><router-link v-if="a.n > 0 && a.to" class="btn ghost sm" :to="a.to">{{ a.label }}</router-link></li></ul></section>
        <section class="card" aria-labelledby="sd"><h2 id="sd">Mentor supply and student demand</h2><p class="muted">Students interested in each career area, against places mentors still have free. Gaps are listed first.</p>
          <div class="legend"><span class="d">Students interested</span><span class="s">Free mentor places</span></div>
          <div class="sdrow" v-for="r in sd" :key="r.a"><span class="sdl"><b>{{ r.a }}</b><span v-if="r.demand > r.supply" class="badge pending">Gap</span></span>
            <span class="sdbar"><i class="d" :style="{ width: r.demand / sdmax * 100 + '%' }"></i><i class="s" :style="{ width: r.supply / sdmax * 100 + '%' }"></i></span><span class="muted sdn">{{ r.demand }} / {{ r.supply }}</span></div></section>
      </div>
      <div class="col-side"><section class="card" aria-labelledby="tr"><h2 id="tr">Participation trend</h2><p class="muted">Requests created per week.</p>
        <div class="sdrow" v-for="w in weeks" :key="w.label"><span>{{ w.label }}</span><span class="sdbar"><i class="s" :style="{ width: w.n / wmax * 100 + '%' }"></i></span><span class="sdn">{{ w.n }}</span></div>
        <p class="muted">Accepted {{ rc('accepted') }} · rejected {{ rc('rejected') }} · expired {{ rc('expired') }} · acceptance rate {{ rate }}</p></section>
        <section class="card" aria-labelledby="ac"><h2 id="ac">Recent mentoring activity</h2><p class="muted">Names and status changes only. Message content is never shown.</p>
        <ul class="feed"><li v-for="(e, i) in activity" :key="i">{{ e.text }}<br /><span class="muted">{{ fmt(e.at) }}</span></li></ul></section></div>
    </div>
  </template>
  <AdminUsers v-else-if="tab === 'users'" />
  <MatchingPanel v-else-if="tab === 'matching'" />
  <AdminContent v-else-if="tab === 'content'" />
  <AdminReports v-else />
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { state, userById, openSlots, DAY ,live} from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
import AdminUsers from '../../components/admin/AdminUsers.vue'
import AdminContent from '../../components/admin/AdminContent.vue'
import AdminReports from '../../components/admin/AdminReports.vue'
import MatchingPanel from '../../components/MatchingPanel.vue'
import { weeklyRequests } from '../../utils/insights'
const route = useRoute(), tab = computed(() => route.query.tab || 'overview')
const rlabel = { open: 'Open', review: 'Under review', resolved: 'Resolved' }
const n = r => state.users.filter(u => u.role === r && live(u).length, rc = s => state.requests.filter(r => r.status === s).length
const rate = computed(() => { const a = rc('accepted'), t = a + rc('rejected'); return t ? Math.round(a / t * 100) + '%' : 'n/a' })
const openReports = computed(() => state.reports.filter(r => r.status !== 'resolved').length)
const tabs = computed(() => [['overview', 'Overview'], ['users', 'Users'], ['matching', 'Matching'], ['content', 'Content'], ['reports', 'Reports']])
const titles = { overview: 'Programme overview', users: 'Users', matching: 'Matching', content: 'Content', reports: 'Reports' }
const weeks = computed(weeklyRequests), wmax = computed(() => Math.max(1, ...weeks.value.map(w => w.n)))
const mentorsAll = computed(() => state.users.filter(u => u.role === 'mentor' && live(u)), studentsAll = computed(() => state.users.filter(u => u.role === 'student'))
const attention = computed(() => {
  const stuck = state.requests.filter(r => r.status === 'pending' && Date.now() - r.createdAt > 7 * DAY).length
  const full = mentorsAll.value.filter(m => m.title && !m.paused && openSlots(m) === 0).length
  return [
    { n: openReports.value, t: 'Reports waiting for review', d: 'Open or under review', to: '/admin/dashboard?tab=reports', label: 'Review' },
    { n: stuck, t: 'Requests waiting over a week', d: 'Students may need another route to a mentor', to: '/admin/dashboard?tab=users', label: 'View users' },
    { n: mentorsAll.value.filter(m => m.title && !m.verified).length, t: 'Mentors awaiting verification', d: 'Hidden from students until verified', to: '/admin/dashboard?tab=users', label: 'Verify' },
    { n: full, t: 'Mentors with no free places', d: 'Demand may exceed supply', to: '', label: '' },
    { n: state.users.filter(u => u.active === false).length, t: 'Deactivated accounts', d: 'Review whether any should return', to: '/admin/dashboard?tab=users', label: 'View users' }
  ]
})
const match = (a, m) => [...m.expertise, m.industry].some(x => x.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(x.toLowerCase()))
const sd = computed(() => [...new Set(studentsAll.value.flatMap(s => s.interests))].map(a => ({ a, demand: studentsAll.value.filter(s => s.interests.includes(a)).length,
  supply: mentorsAll.value.filter(m => m.title && m.active !== false && match(a, m)).reduce((t, m) => t + openSlots(m), 0) })).sort((x, y) => (y.demand - y.supply) - (x.demand - x.supply)))
const sdmax = computed(() => Math.max(1, ...sd.value.flatMap(r => [r.demand, r.supply])))
const activity = computed(() => state.requests.flatMap(r => r.history.map(h => { const s = userById(r.studentId).name, m = userById(r.mentorId).name
  const text = !h.from ? `${s} sent a request to ${m}` : h.to === 'expired' ? `${s}'s request to ${m} expired` : h.to === 'withdrawn' ? `${s} withdrew a request to ${m}` : `${m} ${h.to} ${s}'s request`; return { at: h.at, text } })).sort((a, b) => b.at - a.at).slice(0, 7))
</script>
