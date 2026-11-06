<template>
  <PageHeader title="Mentees" desc="Students you are currently mentoring. Goals are read only." />
  <EmptyState v-if="!rows.length" icon="users" title="No active mentees yet" text="When you accept a request, the student appears here with their goals."><router-link class="btn sm" to="/mentor/requests">Review requests</router-link></EmptyState>
  <div class="results">
    <article v-for="m in rows" :key="m.id" class="card">
      <div class="mc-head"><Avatar :name="userById(m.studentId).name" :size="46" /><div><h3>{{ userById(m.studentId).name }}</h3><p class="muted">{{ userById(m.studentId).programme }} · since {{ fmt(m.since) }}</p></div></div>
      <p class="chips"><span v-for="i in userById(m.studentId).interests" :key="i">{{ i }}</span></p>
      <p class="muted">{{ userById(m.studentId).email }}</p>
      <div class="row"><router-link class="btn ghost sm" to="/mentor/sessions">Sessions</router-link><router-link class="btn ghost sm" to="/mentor/feedback">Give feedback</router-link></div>
      <h4>Goals: {{ done(m) }} of {{ goals(m).length }} done</h4>
      <div class="bar"><i :style="{ width: (goals(m).length ? done(m) / goals(m).length * 100 : 0) + '%' }"></i></div>
      <p v-if="!goals(m).length" class="muted">No goals recorded yet.</p>
      <ul class="plain"><li v-for="g in goals(m)" :key="g.id" class="goalrow"><span>{{ g.title }}</span><span class="muted">{{ label[g.status] }} · {{ fmt(g.target) }}</span></li></ul>
    </article>
  </div>
  <section class="card" aria-labelledby="og"><h2 id="og">Open goals from students <span class="count">{{ open.length }}</span></h2><p class="muted">Shared anonymously by students who want guidance. Read only.</p>
    <p v-if="!open.length" class="muted">No open goals right now.</p>
    <ul class="plain"><li v-for="g in open" :key="g.id"><b>{{ g.title }}</b> <span class="chips"><span v-for="t in g.tags" :key="t">{{ t }}</span></span><span class="muted"> · due {{ fmt(g.target) }}</span></li></ul></section>
</template>
<script setup>
import { computed } from 'vue'
import { state, me, userById, activeMentees, openGoals } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
import PageHeader from '../../components/PageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import Avatar from '../../components/Avatar.vue'
const open = computed(openGoals)
const rows = computed(() => activeMentees(me().id)), label = { todo: 'To do', doing: 'In progress', done: 'Done' }
const goals = m => state.goals.filter(g => g.studentId === m.studentId && g.visibility !== 'me'), done = m => goals(m).filter(g => g.status === 'done').length
</script>
