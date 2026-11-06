<template>
  <PageHeader title="Find a mentor" desc="Compare alumni by career area and expertise. Places show how many students each mentor can still take." />
  <div class="dir">
    <aside class="card facets" aria-label="Filters">
      <label for="q">Search</label><div class="searchbox"><Icon name="search" :size="16" /><input id="q" v-model="q" placeholder="Name, role, company or topic" /></div>
      <label>Career area</label>
      <div class="chipset"><button class="chipbtn" :class="{ on: !ind }" :aria-pressed="!ind" @click="ind = ''">All</button><button v-for="i in inds" :key="i" class="chipbtn" :class="{ on: ind === i }" :aria-pressed="ind === i" @click="ind = i">{{ i }}</button></div>
      <label for="ex">Expertise</label><select id="ex" v-model="exp"><option value="">Any expertise</option><option v-for="x in exps" :key="x">{{ x }}</option></select>
      <label for="so">Sort by</label><select id="so" v-model="sort"><option value="match">Best match for me</option><option value="slots">Most places free</option><option value="exp">Most experience</option></select>
      <label class="inline switch"><input type="checkbox" v-model="slots" /> Only mentors with places free</label>
      <button class="btn ghost block" @click="clear">Clear filters</button>
    </aside>
    <section aria-live="polite">
      <p class="muted resultbar">{{ res.length }} of {{ all.length }} mentors<template v-if="u.interests.length"> · matched against your interests: {{ u.interests.join(', ') }}</template></p>
      <EmptyState v-if="!res.length" icon="search" title="No mentors match these filters" text="Try another career area or turn off the places filter. Mentors join regularly."><button class="btn sm" @click="clear">Clear filters</button></EmptyState>
      <div class="results"><MentorCard v-for="m in pageRes" :key="m.id" :m="m" :hits="hits(m)" /></div>
      <nav v-if="pages > 1" class="row pager" aria-label="Pagination"><button class="btn ghost sm" :disabled="page <= 1" @click="page--">Previous</button><span>Page {{ page }} of {{ pages }}</span><button class="btn ghost sm" :disabled="page >= pages" @click="page++">Next</button></nav>
    </section>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { me, mentors, openSlots } from '../../composables/useStore'
import PageHeader from '../../components/PageHeader.vue'
import MentorCard from '../../components/MentorCard.vue'
import EmptyState from '../../components/EmptyState.vue'
import Icon from '../../components/Icon.vue'
const PAGE = 6, page = ref(1), q = ref(''), ind = ref(''), exp = ref(''), slots = ref(false), sort = ref('match')
const u = computed(me), all = computed(mentors)
const inds = computed(() => [...new Set(all.value.map(m => m.industry))].sort())
const exps = computed(() => [...new Set(all.value.flatMap(m => m.expertise))].sort())
// Transparent matching: shows which of the student's interests overlap with the mentor's expertise or industry.
const hits = m => { const t = [...m.expertise, m.industry].map(x => x.toLowerCase()); return u.value.interests.filter(i => t.some(x => x.includes(i.toLowerCase()) || i.toLowerCase().includes(x))) }
const res = computed(() => all.value.filter(m => (m.name + m.title + m.company + m.expertise.join(' ')).toLowerCase().includes(q.value.toLowerCase()) &&
  (!ind.value || m.industry === ind.value) && (!exp.value || m.expertise.includes(exp.value)) && (!slots.value || openSlots(m) > 0))
  .sort((a, b) => sort.value === 'slots' ? openSlots(b) - openSlots(a) : sort.value === 'exp' ? b.years - a.years : hits(b).length - hits(a).length || openSlots(b) - openSlots(a)))
const pages = computed(() => Math.max(1, Math.ceil(res.value.length / PAGE))), pageRes = computed(() => res.value.slice((Math.min(page.value, pages.value) - 1) * PAGE, Math.min(page.value, pages.value) * PAGE))
watch([q, ind, exp, slots, sort], () => { page.value = 1 })
const clear = () => { q.value = ind.value = exp.value = ''; slots.value = false; sort.value = 'match' }
</script>
