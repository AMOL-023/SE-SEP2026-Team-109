<template>
  <PageHeader title="Account" desc="Report a concern, share anonymous feedback, or manage your account." />
  <div class="grid two">
    <section class="card" aria-labelledby="rp"><h2 id="rp">Report a user</h2>
      <p class="muted">Reports go to programme administrators only. Describe what happened; evidence is optional.</p>
      <label for="ru">Who are you reporting?</label><select id="ru" v-model="r.who"><option value="">Select a person</option><option v-for="p in people" :key="p.id" :value="p.id">{{ p.name }} ({{ p.role }})</option></select>
      <label for="rc">Category</label><select id="rc" v-model="r.cat"><option value="">Select a category</option><option v-for="c in cats" :key="c">{{ c }}</option></select>
      <label for="rd">What happened?</label><textarea id="rd" v-model="r.desc" rows="4" maxlength="1000"></textarea><p class="hint">{{ r.desc.trim().length }} / 1000 · at least 20</p>
      <label for="re">Evidence (optional)</label><input id="re" type="file" accept="image/*,.pdf" @change="r.file = $event.target.files[0]?.name || ''" />
      <p class="hint">Demo only: the file name is recorded, nothing is uploaded.</p>
      <p v-if="rerr" class="error" role="alert">{{ rerr }}</p>
      <button class="btn" @click="report">Submit report</button></section>
    <section class="card" aria-labelledby="mr"><h2 id="mr">My reports</h2>
      <p v-if="!mine.length" class="muted">You have not submitted any reports.</p>
      <ul class="plain"><li v-for="x in mine" :key="x.id"><div class="row between"><b>{{ x.category }}</b><span class="badge" :class="x.status === 'resolved' ? 'accepted' : x.status === 'review' ? 'pending' : 'rejected'">{{ lbl[x.status] }}</span></div><span class="muted">{{ fmt(x.createdAt) }} · investigation details are confidential</span></li></ul></section>
    <section class="card" aria-labelledby="pf"><h2 id="pf">Anonymous platform feedback</h2>
      <p class="muted">Tell the programme team what works and what does not. Your name is not stored with this message.</p>
      <label for="pt">Your feedback</label><textarea id="pt" v-model="pf" rows="4" maxlength="500"></textarea><p class="hint">{{ pf.length }} / 500</p>
      <p v-if="perr" class="error" role="alert">{{ perr }}</p>
      <button class="btn" @click="sendPf">Send anonymously</button></section>
    <section class="card" aria-labelledby="dl"><h2 id="dl">Delete my account</h2>
      <p class="muted">Your personal information is deleted or anonymised after a {{ RETENTION_DAYS }}-day retention period. Records needed for audit stay in anonymised form.</p>
      <button class="btn danger" @click="ask = true">Request account deletion</button></section>
  </div>
  <ConfirmModal v-if="ask" title="Delete your account?" ok="Yes, request deletion" danger @ok="del" @cancel="ask = false">
    <p>Please read what will happen:</p>
    <ul><li>{{ pend }} pending request(s) will be closed and the other person notified.</li><li>{{ act }} active mentorship(s) will end.</li><li>You will be signed out and cannot sign in again.</li><li>Your data is anonymised after {{ RETENTION_DAYS }} days.</li></ul></ConfirmModal>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { state, me, userById, submitReport, sendPlatformFeedback, requestDeletion, logout, toast, RETENTION_DAYS } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
import PageHeader from '../../components/PageHeader.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
const router = useRouter(), u = computed(me), r = reactive({ who: '', cat: '', desc: '', file: '' }), rerr = ref(''), pf = ref(''), perr = ref(''), ask = ref(false)
const cats = ['Inappropriate language', 'Harassment', 'Mentor stopped replying', 'Asking for personal favours', 'Privacy concern', 'Other'], lbl = { open: 'Open', review: 'Under review', resolved: 'Resolved' }
const people = computed(() => { const ids = new Set(); state.mentorships.forEach(m => { if (m.studentId === u.value.id) ids.add(m.mentorId); if (m.mentorId === u.value.id) ids.add(m.studentId) }); state.requests.forEach(x => { if (x.studentId === u.value.id) ids.add(x.mentorId); if (x.mentorId === u.value.id) ids.add(x.studentId) }); return [...ids].map(userById) })
const mine = computed(() => state.reports.filter(x => x.reporterId === u.value.id))
const pend = computed(() => state.requests.filter(x => x.status === 'pending' && (x.studentId === u.value.id || x.mentorId === u.value.id)).length)
const act = computed(() => state.mentorships.filter(m => m.active && (m.studentId === u.value.id || m.mentorId === u.value.id)).length)
function report() { rerr.value = submitReport(u.value.id, r.who, r.cat, r.desc, r.file) || ''; if (!rerr.value) { toast('Report submitted'); Object.assign(r, { who: '', cat: '', desc: '', file: '' }) } }
function sendPf() { perr.value = sendPlatformFeedback(pf.value) || ''; if (!perr.value) { toast('Thank you. Feedback sent anonymously.'); pf.value = '' } }
async function del() { requestDeletion(u.value.id); ask.value = false; await router.push('/login'); logout(); toast('Deletion requested. You have been signed out.') }
</script>
