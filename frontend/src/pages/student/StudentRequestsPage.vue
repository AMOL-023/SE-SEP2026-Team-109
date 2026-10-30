<template>
  <h1>My requests</h1>
  <div class="tabs" role="tablist"><button v-for="t in tabs" :key="t" role="tab" :aria-selected="tab === t" :class="{ on: tab === t }" @click="tab = t">{{ t }} ({{ count(t) }})</button></div>
  <div v-if="!shown.length" class="card empty"><p>No {{ tab === 'all' ? '' : tab }} requests. <router-link to="/student/mentors">Find a mentor</router-link></p></div>
  <article v-for="r in shown" :key="r.id" class="card">
    <div class="row between"><h3>{{ userById(r.mentorId).name }}</h3><Badge :s="r.status" /></div>
    <p class="muted">Sent {{ fmt(r.createdAt) }}<template v-if="r.status === 'pending'">. Expires {{ fmt(r.expiresAt) }}</template></p>
    <p>{{ r.message }}</p>
    <p v-if="r.status === 'rejected' && r.reason" class="note">Mentor's reason: {{ r.reason }}</p>
    <p v-if="r.status === 'accepted'" class="note">Accepted. Contact your mentor at {{ userById(r.mentorId).email }}</p>
    <details><summary>Status history</summary><RequestTimeline :history="r.history" /></details>
    <button v-if="r.status === 'pending'" class="btn ghost" @click="ask = r">Withdraw request</button>
  </article>
  <ConfirmModal v-if="ask" title="Withdraw this request?" ok="Withdraw" danger @ok="doIt" @cancel="ask = null"><p>This frees one of your 3 pending slots and cannot be undone.</p></ConfirmModal>
</template>
<script setup>
import { ref, computed } from 'vue'
import { state, me, userById, withdraw, toast } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
import Badge from '../../components/Badge.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
import RequestTimeline from '../../components/RequestTimeline.vue'
const tabs = ['all', 'pending', 'accepted', 'rejected', 'expired', 'withdrawn'], tab = ref('all'), ask = ref(null)
const mine = computed(() => state.requests.filter(r => r.studentId === me().id))
const count = t => (t === 'all' ? mine.value.length : mine.value.filter(r => r.status === t).length)
const shown = computed(() => (tab.value === 'all' ? mine.value : mine.value.filter(r => r.status === tab.value)))
function doIt() { const e = withdraw(ask.value.id, me().id); e ? toast(e, 'err') : toast('Request withdrawn'); ask.value = null }
</script>
