<template>
  <div v-if="!m" class="card empty"><p>This mentor could not be found.</p><router-link to="/student/mentors">Back to directory</router-link></div>
  <template v-else>
    <router-link to="/student/mentors">Back to directory</router-link>
    <div class="card"><div class="row between"><div><h1>{{ m.name }}</h1><p class="muted">{{ m.title }} at {{ m.company }}. {{ m.years }} years of experience. {{ m.industry }}</p></div>
      <span class="badge" :class="m.paused ? 'expired' : slots ? 'accepted' : 'rejected'">{{ m.paused ? 'Paused' : slots ? slots + ' open' : 'No open slots' }}</span></div>
      <h2>About</h2><p>{{ m.bio }}</p>
      <h2>Expertise</h2><p class="chips"><span v-for="x in m.expertise" :key="x">{{ x }}</span></p>
      <h2>Support offered</h2><p>{{ m.support.join(', ') }}</p>
      <p class="muted">Capacity: {{ m.capacity }} mentees. Currently mentoring {{ active }}.</p>
      <router-link v-if="slots" class="btn" :to="`/student/mentors/${m.id}/request`">Request mentoring</router-link>
      <button v-else class="btn" disabled>{{ m.paused ? 'Not accepting requests' : 'No open slots' }}</button></div>
  </template>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { userById, openSlots, activeMentees } from '../../composables/useStore'
const route = useRoute()
const m = computed(() => { const x = userById(route.params.mentorId); return x && x.role === 'mentor' && x.title ? x : null })
const slots = computed(() => (m.value ? openSlots(m.value) : 0))
const active = computed(() => (m.value ? activeMentees(m.value.id).length : 0))
</script>
