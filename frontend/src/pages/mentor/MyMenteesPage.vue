<template>
  <h1>My mentees</h1>
  <div v-if="!rows.length" class="card empty"><p>You have no active mentees yet. Accepted requests appear here.</p></div>
  <article v-for="m in rows" :key="m.id" class="card">
    <div class="row between"><h3>{{ userById(m.studentId).name }}</h3><span class="badge accepted">Active since {{ fmt(m.since) }}</span></div>
    <p class="muted">{{ userById(m.studentId).programme }}. {{ userById(m.studentId).interests.join(', ') }}. {{ userById(m.studentId).email }}</p>
    <h4>Career goals (read only)</h4><p v-if="!goals(m).length" class="muted">No goals recorded yet.</p>
    <ul class="plain"><li v-for="g in goals(m)" :key="g.id">{{ g.title }} <span class="muted">{{ label[g.status] }}, target {{ fmt(g.target) }}</span></li></ul>
  </article>
</template>
<script setup>
import { computed } from 'vue'
import { state, me, userById, activeMentees } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
const rows = computed(() => activeMentees(me().id)), label = { todo: 'To do', doing: 'In progress', done: 'Done' }
const goals = m => state.goals.filter(g => g.studentId === m.studentId)
</script>
