<template>
  <EmptyState v-if="!m" icon="search" title="Mentor not found" text="This profile does not exist or is no longer available."><router-link class="btn sm" to="/student/mentors">Back to directory</router-link></EmptyState>
  <template v-else>
    <PageHeader :title="m.name" :crumbs="[['Find Mentors', '/student/mentors'], [m.name]]" />
    <section class="card profile-head"><Avatar :name="m.name" :size="72" />
      <div class="ph-id"><h2>{{ m.title }} at {{ m.company }}</h2><p class="muted">{{ m.years }} years of experience · {{ m.industry }}</p>
        <p class="chips"><span v-for="x in m.expertise" :key="x">{{ x }}</span></p></div>
      <span class="badge" :class="m.paused ? 'expired' : slots ? 'accepted' : 'rejected'">{{ m.paused ? 'Paused' : slots ? slots + ' open' : 'No open slots' }}</span></section>
    <div class="grid two">
      <section class="card"><h2>About</h2><p>{{ m.bio }}</p><h2>Support offered</h2><ul class="ticks"><li v-for="s in m.support" :key="s"><Icon name="check" :size="16" /> {{ s }}</li></ul></section>
      <section class="card"><h2>Mentoring capacity</h2>
        <div class="bar"><i :style="{ width: Math.min(100, active / m.capacity * 100) + '%' }"></i></div>
        <p class="muted">{{ active }} of {{ m.capacity }} mentee places in use{{ m.paused ? '. This mentor has paused new requests.' : '.' }}</p>
        <router-link v-if="slots" class="btn block" :to="`/student/mentors/${m.id}/request`">Request mentoring <Icon name="arrow" :size="16" /></router-link>
        <button v-else class="btn block" disabled>{{ m.paused ? 'Not accepting requests' : 'No open slots' }}</button></section>
    </div>
    <div class="grid two">
      <section class="card" aria-labelledby="av"><h2 id="av">Availability</h2>
        <template v-if="matched"><p v-if="!open.length" class="muted">No open slots at the moment.</p><ul class="plain"><li v-for="a in open" :key="a.id">{{ fmtDT(a.start) }}</li></ul><router-link class="btn sm" to="/student/sessions">Request a session</router-link></template>
        <p v-else class="muted">Availability is shown only to students with an active mentorship with this mentor.</p></section>
      <section class="card" aria-labelledby="pb"><h2 id="pb">Public feedback <span class="count">{{ pub.length }}</span></h2>
        <p v-if="!pub.length" class="muted">No public feedback yet. Students decide whether to share their final feedback.</p>
        <ul class="plain"><li v-for="f in pub" :key="f.id"><b>{{ avgScore(f) }} / 5</b> · {{ f.comments || 'No comments' }}</li></ul></section>
    </div>
  </template>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { state, me, userById, openSlots, activeMentees, mentorshipOf, avgScore, fmtDT } from '../../composables/useStore'
import PageHeader from '../../components/PageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import Avatar from '../../components/Avatar.vue'
import Icon from '../../components/Icon.vue'
const route = useRoute()
const m = computed(() => { const x = userById(route.params.mentorId); return x && x.role === 'mentor' && x.title ? x : null })
const matched = computed(() => m.value && mentorshipOf(me().id, m.value.id)), open = computed(() => state.availability.filter(a => m.value && a.mentorId === m.value.id && a.status === 'open' && a.start > Date.now()).sort((a, b) => a.start - b.start))
const pub = computed(() => state.feedback.filter(f => m.value && f.toId === m.value.id && f.isPublic))
const slots = computed(() => (m.value ? openSlots(m.value) : 0))
const active = computed(() => (m.value ? activeMentees(m.value.id).length : 0))
</script>
