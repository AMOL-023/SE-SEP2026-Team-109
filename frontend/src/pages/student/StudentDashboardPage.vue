<template>
  <header class="greet"><p class="eyebrow">{{ u.programme || 'Programme not set' }}</p><h1>{{ greeting() }}, {{ u.name.split(' ')[0] }}</h1></header>
  <div class="ws">
    <div class="col-main">
      <section class="card next" :class="{ attention: next.attention }" aria-labelledby="nx">
        <div><p class="eyebrow" id="nx">Your next step</p><h2>{{ next.title }}</h2><p class="muted">{{ next.text }}</p></div>
        <router-link class="btn" :to="next.to">{{ next.label }} <Icon name="arrow" :size="16" /></router-link>
      </section>
      <section class="card journey" aria-labelledby="jt"><h2 id="jt">Mentoring journey</h2>
        <ol><li v-for="(s, i) in steps" :key="s.t" :class="s.st" :aria-current="s.st === 'current' ? 'step' : null">
          <span class="num"><Icon v-if="s.st === 'done'" name="check" :size="14" /><template v-else>{{ i + 1 }}</template></span><b>{{ s.t }}</b><span class="muted">{{ s.d }}</span></li></ol></section>
      <section class="card" aria-labelledby="rm"><div class="row between"><h2 id="rm">Career roadmap</h2><router-link to="/student/goals">Open roadmap</router-link></div>
        <EmptyState v-if="!goals.length" icon="target" title="No goals yet" text="Goals turn advice into steps. Mentors can see them and help you stay on track."><router-link class="btn sm" to="/student/goals">Add your first goal</router-link></EmptyState>
        <div v-else class="rm-mini"><Ring :pct="gpct" />
          <div class="grow"><p class="muted">{{ done }} of {{ goals.length }} goals done. Coming up next:</p>
            <ul class="plain"><li v-for="g in upcoming" :key="g.id" class="goalrow"><span><b>{{ g.title }}</b><br /><span class="muted">{{ g.status === 'doing' ? 'In progress' : 'To do' }}</span></span><span class="due" :class="{ late: late(g) }"><Icon name="calendar" :size="14" /> {{ fmt(g.target) }}</span></li></ul></div></div></section>
    </div>
    <div class="col-side">
      <section class="card" aria-labelledby="mm"><h2 id="mm">Your mentoring</h2>
        <ul v-if="mentorships.length" class="plain"><li v-for="m in mentorships" :key="m.id" class="person"><Avatar :name="userById(m.mentorId).name" :size="40" /><div><b>{{ userById(m.mentorId).name }}</b><br /><span class="muted">{{ userById(m.mentorId).title }} · mentoring since {{ fmt(m.since) }}</span></div></li></ul>
        <h3 v-if="pending.length" class="sub">Waiting for a reply</h3>
        <ul class="plain"><li v-for="r in pending" :key="r.id" class="goalrow"><span><b>{{ userById(r.mentorId).name }}</b><br /><span class="muted">Closes in {{ left(r) }} day{{ left(r) === 1 ? '' : 's' }}</span></span><Badge s="pending" /></li></ul>
        <p v-if="!mentorships.length && !pending.length" class="muted">No active mentor or open request yet.</p>
        <div class="row"><router-link class="btn ghost sm" to="/student/requests">All requests</router-link><router-link class="btn ghost sm" to="/student/mentors">Find mentors</router-link></div></section>
      <section class="card" aria-labelledby="us"><div class="row between"><h2 id="us">Upcoming sessions</h2><router-link to="/student/sessions">Sessions</router-link></div>
        <p v-if="!upcoming2.length" class="muted">{{ mentorships.length ? 'No sessions scheduled. Request one from your mentor’s open slots.' : 'Sessions open up once you have a mentor.' }}</p>
        <ul class="plain"><li v-for="s in upcoming2" :key="s.id"><b>{{ userById(s.mentorId).name }}</b><br /><span class="muted">{{ fmtDT(s.start) }}</span></li></ul></section>
      <section class="card" aria-labelledby="ra"><div class="row between"><h2 id="ra">Recent activity</h2><router-link to="/notifications">All</router-link></div>
        <p v-if="!feed.length" class="muted">Updates about your requests will appear here.</p>
        <ul class="feed"><li v-for="n in feed" :key="n.id"><router-link :to="n.link || '/notifications'">{{ n.text }}</router-link><br /><span class="muted">{{ fmt(n.at) }}</span></li></ul></section>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { state, me, userById, pendingOf, DAY, sessionsOf, fmtDT } from '../../composables/useStore'
import { fmt, greeting } from '../../utils/helpers'
import Icon from '../../components/Icon.vue'
import Avatar from '../../components/Avatar.vue'
import Ring from '../../components/Ring.vue'
import Badge from '../../components/Badge.vue'
import EmptyState from '../../components/EmptyState.vue'
const u = computed(me)
const pct = computed(() => Math.round([u.value.programme, u.value.interests.length, u.value.needs, u.value.skills.length].filter(Boolean).length * 25))
const reqs = computed(() => state.requests.filter(r => r.studentId === u.value.id))
const pending = computed(() => pendingOf(u.value.id))
const mentorships = computed(() => state.mentorships.filter(m => m.studentId === u.value.id && m.active))
const goals = computed(() => state.goals.filter(g => g.studentId === u.value.id))
const done = computed(() => goals.value.filter(g => g.status === 'done').length)
const gpct = computed(() => (goals.value.length ? Math.round(done.value / goals.value.length * 100) : 0))
const upcoming = computed(() => goals.value.filter(g => g.status !== 'done').sort((a, b) => a.target.localeCompare(b.target)).slice(0, 3))
const feed = computed(() => state.notifications.filter(n => n.userId === u.value.id).sort((a, b) => b.at - a.at).slice(0, 5))
const upcoming2 = computed(() => sessionsOf(u.value.id).filter(s => s.status === 'scheduled' && s.start > Date.now()).slice(0, 3))
const left = r => Math.max(0, Math.ceil((r.expiresAt - Date.now()) / DAY))
const late = g => new Date(g.target) < new Date(new Date().toDateString())
const steps = computed(() => {
  const flags = [pct.value === 100, reqs.value.length > 0, mentorships.value.length > 0, goals.value.length > 0, done.value > 0]
  const raw = [['Complete profile', 'Tell mentors who you are'], ['Send a request', 'Ask a mentor to guide you'], ['Begin mentoring', 'A mentor accepts'], ['Set a goal', 'Make progress visible'], ['Reach a goal', 'Mark your first one done']]
  const cur = flags.indexOf(false)
  return raw.map((r, i) => ({ t: r[0], d: r[1], st: flags[i] ? 'done' : i === cur ? 'current' : 'todo' }))
})
const next = computed(() => {
  if (pct.value < 100) return { title: 'Finish your profile', text: `You are at ${pct.value}%. Mentors read your interests and needs before they reply.`, label: 'Complete profile', to: '/student/profile' }
  if (!reqs.value.length && !mentorships.value.length) return { title: 'Find your first mentor', text: 'Search alumni by career area. The directory shows who has open places and who matches your interests.', label: 'Explore mentors', to: '/student/mentors' }
  if (pending.value.length && !mentorships.value.length) return { title: `${pending.value.length} request${pending.value.length > 1 ? 's are' : ' is'} waiting for a reply`, text: 'Requests close after 14 days. You can withdraw one to free a place for another mentor.', label: 'Review requests', to: '/student/requests', attention: true }
  if (!goals.value.length) return { title: 'Set your first career goal', text: 'A goal with a date gives your mentor something concrete to work on with you.', label: 'Add a goal', to: '/student/goals' }
  const g = upcoming.value[0]
  return g ? { title: `Next goal: ${g.title}`, text: `Due ${fmt(g.target)}. Update its status when you make progress.`, label: 'Continue roadmap', to: '/student/goals', attention: late(g) } : { title: 'All goals complete', text: 'Add a new goal to keep your momentum.', label: 'Open roadmap', to: '/student/goals' }
})
</script>
