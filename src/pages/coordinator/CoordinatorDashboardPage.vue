<template>
  <PageHeader title="Programme insights" desc="Aggregate numbers only. Names, emails, photos and request messages are never shown here." />
  <section class="card figures" aria-label="Figures"><div><b>{{ students().length }}</b><span class="muted">Students</span></div><div><b>{{ verifiedMentors().length }}</b><span class="muted">Verified mentors</span></div><div><b>{{ state.mentorships.filter(m => m.active).length }}</b><span class="muted">Active mentorships</span></div><div><b>{{ reqCount('pending') }}</b><span class="muted">Pending · {{ stuck.length }} stuck</span></div></section>
  <div class="ws adm">
    <div class="col-main">
      <section class="card" aria-labelledby="sd"><h2 id="sd">Supply and demand by career area</h2><p class="muted">{{ mentorsWithRoom() }} mentors have free places. Gaps are listed first.</p>
        <div class="scroll"><table><thead><tr><th>Area</th><th>Students interested</th><th>Free mentor places</th><th>Status</th></tr></thead><tbody>
          <tr v-for="r in sd" :key="r.a"><td>{{ r.a }}</td><td>{{ r.demand }}</td><td>{{ r.supply }}</td><td><span class="badge" :class="r.demand > r.supply ? 'pending' : 'accepted'">{{ r.demand > r.supply ? 'Gap' : 'Covered' }}</span></td></tr></tbody></table></div></section>
      <section class="card" aria-labelledby="sr"><h2 id="sr">Stuck requests</h2><p class="muted">Pending for more than 7 days. Status and age only.</p>
        <p v-if="!stuck.length" class="muted">No stalled requests right now.</p>
        <div class="scroll" v-else><table><thead><tr><th>Reference</th><th>Status</th><th>Age</th><th>Action</th></tr></thead><tbody>
          <tr v-for="s in stuck" :key="s.id"><td>{{ s.ref }}</td><td><Badge :s="s.status" /></td><td>{{ s.ageDays }} days</td><td><button class="btn ghost sm" @click="nudge(s)">Remind mentor</button></td></tr></tbody></table></div></section>
    </div>
    <div class="col-side">
      <section class="card" aria-labelledby="un"><div class="row between"><h2 id="un">Unmatched students <span class="count">{{ un.length }}</span></h2><router-link to="/coordinator/matching">Match</router-link></div>
        <p class="muted">Shown without name, email or photo.</p><p v-if="!un.length" class="muted">Every student has a mentor.</p>
        <ul class="plain"><li v-for="s in un" :key="s.id"><b>{{ aliasOf(s.id) }}</b><br /><span class="muted">{{ s.programme || 'Programme not set' }} · {{ s.interests.join(', ') || 'no interests yet' }}</span></li></ul></section>
      <section class="card" aria-labelledby="gr"><h2 id="gr">My groups <span class="count">{{ mine.length }}</span></h2>
        <p v-if="!mine.length" class="muted">No mentor-mentee groups are assigned to you yet. An admin can assign them.</p>
        <ul class="plain"><li v-for="m in mine" :key="m.id"><b>{{ userById(m.mentorId).name }}</b> with {{ userById(m.studentId).name }}<br /><span class="muted">since {{ fmt(m.since) }}</span></li></ul></section>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { state, me, userById, aliasOf, stuckRequests, unmatchedStudents, nudgeMentor, toast } from '../../composables/useStore'
import { students, verifiedMentors, reqCount, supplyDemand, mentorsWithRoom } from '../../utils/insights'
import { fmt } from '../../utils/helpers'
import PageHeader from '../../components/PageHeader.vue'
import Badge from '../../components/Badge.vue'
const sd = computed(supplyDemand), stuck = computed(stuckRequests), un = computed(unmatchedStudents)
const mine = computed(() => (state.groups[me().id] || []).map(id => state.mentorships.find(m => m.id === id && m.active)).filter(Boolean))
const nudge = s => { const e = nudgeMentor(me(), s.id); e ? toast(e, 'err') : toast('Reminder sent to the mentor') }
</script>
