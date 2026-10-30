<template>
  <h1>Welcome, {{ u.name.split(' ')[0] }}</h1><p class="muted">Your mentoring workload at a glance.</p>
  <div class="grid stats">
    <div class="card"><p class="muted">Active mentees</p><p class="big">{{ mentees.length }} of {{ u.capacity }}</p><div class="bar"><i :style="{ width: Math.min(100, mentees.length / u.capacity * 100) + '%' }"></i></div><router-link to="/mentor/mentees">View mentees</router-link></div>
    <div class="card"><p class="muted">Pending requests</p><p class="big">{{ pending.length }}</p><router-link to="/mentor/requests">Review requests</router-link></div>
    <div class="card"><p class="muted">Status</p><p class="big">{{ u.paused ? 'Paused' : openSlots(u) ? 'Open' : 'Full' }}</p><span class="muted">{{ openSlots(u) }} open slot(s)</span></div>
    <div class="card"><p class="muted">Profile</p><p class="big">{{ u.title ? 'Live' : 'Incomplete' }}</p><router-link to="/mentor/profile">{{ u.title ? 'Edit profile' : 'Complete profile' }}</router-link></div>
  </div>
  <div class="grid two">
    <section class="card"><h2>Mentoring capacity</h2>
      <label for="cap">Maximum mentees</label><select id="cap" :value="u.capacity" @change="setCap($event.target.value)"><option v-for="n in 10" :key="n" :value="n">{{ n }}</option></select>
      <label class="inline"><input type="checkbox" :checked="u.paused" @change="pause" /> Pause new requests</label>
      <p class="muted">Lowering capacity never ends current mentorships. It only blocks new requests.</p></section>
    <section class="card"><h2>Latest pending requests</h2><p v-if="!pending.length" class="muted">No pending requests.</p>
      <ul class="plain"><li v-for="r in pending.slice(0, 4)" :key="r.id"><router-link :to="`/mentor/requests/${r.id}`">{{ userById(r.studentId).name }}</router-link> <span class="muted">{{ fmt(r.createdAt) }}</span></li></ul></section>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { state, me, userById, activeMentees, openSlots, toast } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
const u = computed(me), mentees = computed(() => activeMentees(u.value.id))
const pending = computed(() => state.requests.filter(r => r.mentorId === u.value.id && r.status === 'pending'))
const setCap = v => { u.value.capacity = Number(v); toast('Capacity set to ' + v) }
const pause = e => { u.value.paused = e.target.checked; toast(u.value.paused ? 'New requests paused' : 'Accepting requests again') }
</script>
