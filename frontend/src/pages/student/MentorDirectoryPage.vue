<template>
  <h1>Find a mentor</h1>
  <div class="card filters">
    <div><label for="q">Search</label><input id="q" v-model="q" placeholder="Name, role, company or topic" /></div>
    <div><label for="in">Industry</label><select id="in" v-model="ind"><option value="">All</option><option v-for="i in inds" :key="i">{{ i }}</option></select></div>
    <div><label for="ex">Expertise</label><select id="ex" v-model="exp"><option value="">All</option><option v-for="x in exps" :key="x">{{ x }}</option></select></div>
    <label class="inline"><input type="checkbox" v-model="slots" /> Has open slots</label>
    <button class="btn ghost" @click="clear">Clear filters</button>
  </div>
  <p class="muted" aria-live="polite">{{ res.length }} mentor{{ res.length === 1 ? '' : 's' }} found</p>
  <div v-if="!res.length" class="card empty"><p>No mentors match these filters. Try adjusting your filters.</p></div>
  <div class="grid cards">
    <article v-for="m in res" :key="m.id" class="card">
      <div class="row between"><h3>{{ m.name }}</h3><span class="badge" :class="slotClass(m)">{{ slotText(m) }}</span></div>
      <p class="muted">{{ m.title }} at {{ m.company }}</p>
      <p class="chips"><span v-for="x in m.expertise" :key="x">{{ x }}</span></p>
      <p class="muted">Offers: {{ m.support.join(', ') }}</p>
      <router-link class="btn ghost" :to="`/student/mentors/${m.id}`">View profile</router-link>
    </article>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { mentors, openSlots } from '../../composables/useStore'
const q = ref(''), ind = ref(''), exp = ref(''), slots = ref(false)
const all = computed(mentors)
const inds = computed(() => [...new Set(all.value.map(m => m.industry))].sort())
const exps = computed(() => [...new Set(all.value.flatMap(m => m.expertise))].sort())
const res = computed(() => all.value.filter(m => (m.name + m.title + m.company + m.expertise.join(' ')).toLowerCase().includes(q.value.toLowerCase()) &&
  (!ind.value || m.industry === ind.value) && (!exp.value || m.expertise.includes(exp.value)) && (!slots.value || openSlots(m) > 0)))
const clear = () => { q.value = ind.value = exp.value = ''; slots.value = false }
const slotText = m => (m.paused ? 'Paused' : openSlots(m) ? `${openSlots(m)} open` : 'No open slots')
const slotClass = m => (m.paused ? 'expired' : openSlots(m) ? 'accepted' : 'rejected')
</script>
