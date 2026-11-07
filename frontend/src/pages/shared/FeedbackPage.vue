<template>
  <PageHeader title="Feedback" desc="Rate a specific session, or give final feedback when a mentorship ends. You can edit it for 15 minutes after sending." />
  <p v-if="!ms.length && !due.length" class="card empty">Feedback is available once you have an active mentorship and a completed session.</p>
  <section v-if="ms.length || due.length" class="card" aria-labelledby="nf"><h2 id="nf">Give feedback</h2>
    <div class="two-col"><div><label for="fk">Type</label><select id="fk" v-model="f.kind"><option value="session">Session feedback</option><option value="final">Final feedback</option></select></div>
      <div v-if="f.kind === 'session'"><label for="fs">Session (most recent first)</label>
        <select id="fs" v-model="f.session"><option value="">Select a session</option><option v-for="s in due" :key="s.id" :value="s.id">{{ other(s).name }} · {{ fmtDT(s.start) }}</option></select></div>
      <div v-else><label for="fm">About</label><select id="fm" v-model="f.ms"><option v-for="m in ms" :key="m.id" :value="m.id">{{ who(m).name }}</option></select></div></div>
    <p v-if="f.kind === 'session' && !due.length" class="hint">You have no completed sessions waiting for feedback. Complete a session first.</p>
    <fieldset><legend>Ratings (1 low, 5 high)</legend><div class="two-col"><div v-for="c in state.criteria" :key="c"><label :for="'c' + c">{{ c }}</label><select :id="'c' + c" v-model.number="f.scores[c]"><option :value="undefined">Choose</option><option v-for="n in 5" :key="n" :value="n">{{ n }}</option></select></div></div></fieldset>
    <label for="fc">Comments (optional)</label><textarea id="fc" v-model="f.comments" rows="3"></textarea><p class="hint">{{ f.comments.length }} / 500</p>
    <label v-if="isStudent && f.kind === 'final'" class="inline"><input type="checkbox" v-model="f.isPublic" /> Make this final feedback public on the mentor's profile</label>
    <p class="hint">{{ f.kind === 'final' && isStudent && f.isPublic ? 'Public: visible to every signed-in student.' : 'Private: only you and programme administrators can see it.' }}</p>
    <p v-if="err" class="error" role="alert">{{ err }}</p><button class="btn" @click="send">Send feedback</button></section>
  <section class="card" aria-labelledby="mf"><h2 id="mf">My feedback <span class="count">{{ mine.length }}</span></h2><p v-if="!mine.length" class="muted">You have not sent any feedback.</p>
    <article v-for="x in mine" :key="x.id" class="sess"><div class="row between"><b>About {{ userById(x.toId).name }} · {{ x.kind === 'final' ? 'Final feedback' : 'Session feedback' }}</b><span class="badge" :class="x.isPublic ? 'accepted' : ''">{{ x.isPublic ? 'Public' : 'Private' }}</span></div>
      <p class="muted">Average {{ avgScore(x) }} / 5 · {{ fmt(x.createdAt) }}<template v-if="sessionOf(x)"> · session on {{ fmtDT(sessionOf(x).start) }}</template></p><p v-if="x.comments">{{ x.comments }}</p>
      <button class="btn ghost sm" :disabled="!canEdit(x)" @click="open(x)">Edit</button><span v-if="!canEdit(x)" class="hint"> The 15-minute edit window has closed.</span></article></section>
  <ConfirmModal v-if="ed" title="Edit feedback" ok="Save changes" @ok="saveEdit" @cancel="ed = null">
    <div v-for="c in state.criteria" :key="c"><label :for="'e' + c">{{ c }}</label><select :id="'e' + c" v-model.number="d.scores[c]"><option v-for="n in 5" :key="n" :value="n">{{ n }}</option></select></div>
    <label for="ec">Comments</label><textarea id="ec" v-model="d.comments" rows="3"></textarea>
    <label v-if="isStudent && ed.kind === 'final'" class="inline"><input type="checkbox" v-model="d.isPublic" /> Public</label><p v-if="eerr" class="error" role="alert">{{ eerr }}</p></ConfirmModal>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { state, me, userById, myMentorships, giveFeedback, editFeedback, feedbackDue, avgScore, fmtDT, EDIT_WINDOW, toast } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
import PageHeader from '../../components/PageHeader.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
const route = useRoute(), u = computed(me), isStudent = computed(() => u.value.role === 'student'), ms = computed(() => myMentorships(u.value.id)), due = computed(() => feedbackDue(u.value.id))
const who = m => userById(m.studentId === u.value.id ? m.mentorId : m.studentId), other = s => userById(s.studentId === u.value.id ? s.mentorId : s.studentId)
const sessionOf = x => state.sessions.find(s => s.id === x.sessionId)
const mine = computed(() => state.feedback.filter(x => x.fromId === u.value.id).sort((a, b) => b.createdAt - a.createdAt))
// Opening this page from a session's history button (?session=ID) pre-selects the type and the session.
const pre = due.value.find(s => s.id === route.query.session) || null
const f = reactive({ kind: 'session', session: pre ? pre.id : (due.value[0]?.id || ''), ms: ms.value[0]?.id || '', scores: {}, comments: '', isPublic: false }), err = ref(''), ed = ref(null), d = reactive({ scores: {}, comments: '', isPublic: false }), eerr = ref('')
const canEdit = x => Date.now() - x.createdAt <= EDIT_WINDOW
function send() {
  const s = state.sessions.find(x => x.id === f.session)
  err.value = giveFeedback({ fromId: u.value.id, mentorshipId: f.kind === 'session' ? (s ? s.mentorshipId : '') : f.ms, kind: f.kind, sessionId: f.session, scores: f.scores, comments: f.comments, isPublic: f.isPublic }) || ''
  if (!err.value) { toast('Feedback sent'); f.scores = {}; f.comments = ''; f.isPublic = false; f.session = due.value[0]?.id || '' }
}
const open = x => { ed.value = x; eerr.value = ''; Object.assign(d, { scores: { ...x.scores }, comments: x.comments, isPublic: x.isPublic }) }
function saveEdit() { eerr.value = editFeedback(ed.value.id, u.value.id, d) || ''; if (!eerr.value) { ed.value = null; toast('Feedback updated') } }
</script>
