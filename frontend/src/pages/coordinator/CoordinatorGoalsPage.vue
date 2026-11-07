<template>
  <PageHeader title="Goals and feedback" desc="Goals that are not private are visible to coordinators. Open goals are shown anonymously." />
  <div class="grid two">
    <section class="card" aria-labelledby="og"><h2 id="og">Open goals <span class="count">{{ open.length }}</span></h2>
      <p v-if="!open.length" class="muted">No open goals yet.</p>
      <ul class="plain"><li v-for="g in open" :key="g.id"><b>{{ g.title }}</b><br /><span class="chips"><span v-for="t in g.tags" :key="t">{{ t }}</span></span><span class="muted">Due {{ fmt(g.target) }} · {{ label[g.status] }}</span></li></ul></section>
    <section class="card" aria-labelledby="sg"><h2 id="sg">Visible to coordinators <span class="count">{{ shared.length }}</span></h2>
      <p v-if="!shared.length" class="muted">No goals are visible to coordinators yet.</p>
      <ul class="plain"><li v-for="g in shared" :key="g.id"><b>{{ g.title }}</b><br /><span class="muted">{{ aliasOf(g.studentId) }} · due {{ fmt(g.target) }} · {{ label[g.status] }}</span></li></ul></section>
  </div>
  <section class="card" aria-labelledby="pf"><h2 id="pf">Anonymous platform feedback</h2>
    <p v-if="!state.platformFeedback.length" class="muted">No feedback yet.</p>
    <ul class="plain"><li v-for="f in state.platformFeedback" :key="f.id">{{ f.text }}<br /><span class="muted">{{ fmt(f.at) }}</span></li></ul></section>
</template>
<script setup>
import { computed } from 'vue'
import { state, openGoals, coordinatorGoals, aliasOf } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
import PageHeader from '../../components/PageHeader.vue'
const label = { todo: 'To do', doing: 'In progress', done: 'Done' }
const open = computed(openGoals), shared = computed(coordinatorGoals)
</script>
