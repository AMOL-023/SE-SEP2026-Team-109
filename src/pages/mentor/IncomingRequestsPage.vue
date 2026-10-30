<template>
  <h1>Incoming requests</h1>
  <div class="tabs" role="tablist"><button v-for="t in tabs" :key="t" role="tab" :aria-selected="tab === t" :class="{ on: tab === t }" @click="tab = t">{{ t }} ({{ count(t) }})</button></div>
  <div v-if="!shown.length" class="card empty"><p>No {{ tab === 'all' ? '' : tab }} requests right now.</p></div>
  <article v-for="r in shown" :key="r.id" class="card">
    <div class="row between"><h3>{{ userById(r.studentId).name }}</h3><Badge :s="r.status" /></div>
    <p class="muted">{{ userById(r.studentId).programme }}. Interested in {{ userById(r.studentId).interests.join(', ') }}. Sent {{ fmt(r.createdAt) }}</p>
    <p class="clip">{{ r.message }}</p>
    <router-link class="btn ghost" :to="`/mentor/requests/${r.id}`">{{ r.status === 'pending' ? 'Review request' : 'View request' }}</router-link>
  </article>
</template>
<script setup>
import { ref, computed } from 'vue'
import { state, me, userById } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
import Badge from '../../components/Badge.vue'
const tabs = ['all', 'pending', 'accepted', 'rejected', 'expired', 'withdrawn'], tab = ref('pending')
const mine = computed(() => state.requests.filter(r => r.mentorId === me().id))
const count = t => (t === 'all' ? mine.value.length : mine.value.filter(r => r.status === t).length)
const shown = computed(() => (tab.value === 'all' ? mine.value : mine.value.filter(r => r.status === tab.value)))
</script>
