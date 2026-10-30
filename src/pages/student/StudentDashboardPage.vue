<template>
  <h1>Welcome back, {{ u.name.split(' ')[0] }}</h1><p class="muted">Where your mentoring stands today.</p>
  <div class="grid stats">
    <div class="card"><p class="muted">Profile completion</p><p class="big">{{ pct }}%</p><div class="bar"><i :style="{ width: pct + '%' }"></i></div>
      <router-link v-if="pct < 100" to="/student/profile">Complete your profile</router-link></div>
    <div class="card"><p class="muted">Pending requests</p><p class="big">{{ pending.length }} of 3</p><router-link to="/student/requests">View requests</router-link></div>
    <div class="card"><p class="muted">Active mentors</p><p class="big">{{ mentorships.length }}</p><router-link to="/student/mentors">Find mentors</router-link></div>
    <div class="card"><p class="muted">Career goals done</p><p class="big">{{ done }} of {{ goals.length }}</p><router-link to="/student/goals">Open goals</router-link></div>
  </div>
  <div class="grid two">
    <section class="card"><h2>Your mentors</h2>
      <p v-if="!mentorships.length" class="muted">You have no active mentor yet. Browse the directory and send a request.</p>
      <ul class="plain"><li v-for="m in mentorships" :key="m.id"><b>{{ userById(m.mentorId).name }}</b><br /><span class="muted">{{ userById(m.mentorId).title }} at {{ userById(m.mentorId).company }}. Since {{ fmt(m.since) }}</span></li></ul></section>
    <section class="card"><h2>Recent notifications</h2>
      <p v-if="!notes.length" class="muted">Nothing new.</p>
      <ul class="plain"><li v-for="n in notes" :key="n.id">{{ n.text }} <span class="muted">{{ fmt(n.at) }}</span></li></ul>
      <router-link to="/notifications">See all</router-link></section>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { state, me, userById, pendingOf } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
const u = computed(me)
const pct = computed(() => Math.round([u.value.programme, u.value.interests.length, u.value.needs, u.value.skills.length].filter(Boolean).length * 25))
const pending = computed(() => pendingOf(u.value.id))
const mentorships = computed(() => state.mentorships.filter(m => m.studentId === u.value.id && m.active))
const goals = computed(() => state.goals.filter(g => g.studentId === u.value.id))
const done = computed(() => goals.value.filter(g => g.status === 'done').length)
const notes = computed(() => state.notifications.filter(n => n.userId === u.value.id).sort((a, b) => b.at - a.at).slice(0, 3))
</script>
