<template>
  <section class="reports"><p v-if="!state.reports.length" class="card empty">No reports have been submitted.</p>
    <article v-for="r in state.reports" :key="r.id" class="card"><div class="row between"><h3>{{ r.category }}</h3><span class="badge" :class="r.status === 'resolved' ? 'accepted' : r.status === 'review' ? 'pending' : 'rejected'">{{ lbl[r.status] }}</span></div>
      <p class="muted">Reported by {{ userById(r.reporterId).name }} about {{ userById(r.reportedId).name }} · {{ fmt(r.createdAt) }}</p><p>{{ r.description }}</p>
      <p v-if="r.evidence" class="note">Evidence: {{ r.evidence }} (name only in this demo)</p>
      <div class="two-col"><div><label :for="'s' + r.id">Status</label><select :id="'s' + r.id" v-model="r.status" @change="toast('Report updated: ' + lbl[r.status])"><option value="open">Open</option><option value="review">Under review</option><option value="resolved">Resolved</option></select></div>
        <div><label :for="'a' + r.id">Action taken</label><input :id="'a' + r.id" v-model="r.action" placeholder="e.g. Spoke to the mentor" @change="toast('Action recorded')" /></div></div></article></section>
</template>
<script setup>
import { state, userById, toast } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
const lbl = { open: 'Open', review: 'Under review', resolved: 'Resolved' }
</script>
