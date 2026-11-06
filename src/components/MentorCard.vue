<template>
  <article class="card mcard">
    <div class="mc-head"><Avatar :name="m.name" :size="46" />
      <div class="mc-id"><h3>{{ m.name }} <span class="badge accepted">Verified</span></h3><p class="muted">{{ m.title }} · {{ m.company }}</p></div></div>
    <p v-if="hits.length" class="match"><Icon name="check" :size="13" /> Matches your interest in {{ hits.join(', ') }}</p>
    <p class="mc-meta"><Icon name="briefcase" :size="14" /> {{ m.years }} years in {{ m.industry }}</p>
    <p class="chips"><span v-for="x in m.expertise.slice(0, 4)" :key="x">{{ x }}</span></p>
    <p class="muted">Can help with: {{ m.support.join(', ') }}</p>
    <div class="mc-cap"><span class="slots" aria-hidden="true"><i v-for="n in m.capacity" :key="n" :class="{ used: n <= active }"></i></span>
      <span class="muted">{{ m.paused ? 'Paused: not taking new requests' : free ? free + ' of ' + m.capacity + ' places free' : 'All places taken' }}</span></div>
    <div class="mc-foot">
      <router-link class="btn ghost sm" :to="`/student/mentors/${m.id}`" :aria-label="'View profile of ' + m.name">View profile</router-link>
      <router-link v-if="free" class="btn sm" :to="`/student/mentors/${m.id}/request`" :aria-label="'Request mentoring from ' + m.name">Request mentoring</router-link>
      <button v-else class="btn sm" disabled :aria-describedby="'why' + m.id">Unavailable</button></div>
    <p v-if="!free" class="hint" :id="'why' + m.id">{{ m.paused ? 'This mentor has paused new requests.' : 'All places are taken. Check back later.' }}</p>
  </article>
</template>
<script setup>
import { computed } from 'vue'
import { openSlots, activeMentees } from '../composables/useStore'
import Avatar from './Avatar.vue'
import Icon from './Icon.vue'
const props = defineProps({ m: Object, hits: { type: Array, default: () => [] } })
const free = computed(() => openSlots(props.m)), active = computed(() => activeMentees(props.m.id).length)
</script>
