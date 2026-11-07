<template>
  <PageHeader title="Sessions" desc="Request a time, confirm it, reschedule if plans change, and log what was discussed. Only the two participants can see a session." />
  <p v-if="!ms.length" class="card empty">You need an active mentorship before you can request or log sessions.</p>

  <section v-if="isStudent && ms.length" class="card" aria-labelledby="bk"><h2 id="bk">Request a session</h2>
    <p class="muted">Your mentor confirms each request. Until then it stays pending. You only see slots of your own mentor.</p>
    <p v-if="!openSlots.length" class="muted">No open slots right now. Ask your mentor to add some.</p>
    <ul class="plain"><li v-for="a in openSlots" :key="a.id" class="row between"><span><b>{{ userById(a.mentorId).name }}</b> · {{ fmtDT(a.start) }} to {{ time(a.end) }}</span><button class="btn sm" @click="request(a)">Request this slot</button></li></ul>
    <p v-if="err" class="error" role="alert">{{ err }}</p></section>

  <section v-if="!isStudent && pending.length" class="card" aria-labelledby="pq"><h2 id="pq">Session requests <span class="count">{{ pending.length }}</span></h2>
    <article v-for="s in pending" :key="s.id" class="sess row between"><span><b>{{ other(s).name }}</b> · {{ fmtDT(s.start) }}</span>
      <span class="row"><button class="btn sm" @click="answer(s, true)">Confirm</button><button class="btn ghost sm" @click="answer(s, false)">Decline</button></span></article></section>

  <section class="card" aria-labelledby="up"><h2 id="up">Upcoming <span class="count">{{ upcoming.length }}</span></h2>
    <p v-if="!upcoming.length" class="muted">Nothing scheduled.</p>
    <article v-for="s in upcoming" :key="s.id" class="sess"><div class="row between"><b>{{ other(s).name }} · {{ fmtDT(s.start) }}</b><span class="badge" :class="s.status === 'requested' ? 'pending' : 'accepted'">{{ s.status === 'requested' ? (isStudent ? 'Waiting for mentor' : 'Needs your reply') : 'Confirmed' }}</span></div>
      <div class="row"><button class="btn ghost sm" @click="openRe(s)">Reschedule</button><button class="btn ghost sm" @click="cancel(s)">{{ s.status === 'requested' && isStudent ? 'Withdraw request' : 'Cancel session' }}</button></div></article></section>

  <section class="card" aria-labelledby="aw"><h2 id="aw">Awaiting notes <span class="count">{{ due.length }}</span></h2>
    <p class="muted">These sessions have started. Add a short summary to complete them.</p><p v-if="!due.length" class="muted">All caught up.</p>
    <article v-for="s in due" :key="s.id" class="sess"><b>{{ other(s).name }} · {{ fmtDT(s.start) }}</b>
      <label :for="'n' + s.id">Summary</label><textarea :id="'n' + s.id" v-model="draft[s.id]" rows="3"></textarea>
      <button class="btn sm" @click="save(s)">Save notes</button></article></section>

  <section class="card" aria-labelledby="ai"><h2 id="ai">Action items</h2>
    <p class="muted">Tasks agreed in completed sessions. Only the person a task is assigned to can tick it off.</p>
    <div class="grid two"><div><h3 class="sub">Assigned to me <span class="count">{{ mineItems.length }}</span></h3><p v-if="!mineItems.length" class="muted">Nothing assigned to you.</p>
        <ul class="plain"><li v-for="i in mineItems" :key="i.id" class="row between"><label class="inline"><input type="checkbox" :checked="i.done" @change="tog(i)" /> <span :class="{ done: i.done }">{{ i.text }}</span></label><span class="row"><span class="hint">{{ fmtDT(i.sessionStart) }}</span><button class="btn ghost sm" :aria-label="'Delete ' + i.text" @click="del(i)">Delete</button></span></li></ul></div>
      <div><h3 class="sub">Assigned to {{ isStudent ? 'my mentor' : 'my mentee' }} <span class="count">{{ theirItems.length }}</span></h3><p v-if="!theirItems.length" class="muted">Nothing assigned to them.</p>
        <ul class="plain"><li v-for="i in theirItems" :key="i.id" class="row between"><span :class="{ done: i.done }">{{ i.done ? '✓ ' : '' }}{{ i.text }}</span><span class="row"><span class="hint">{{ i.done ? 'Done' : 'Open' }}</span><button v-if="i.createdBy === u.id" class="btn ghost sm" :aria-label="'Delete ' + i.text" @click="del(i)">Delete</button></span></li></ul></div></div>
    <h3 class="sub">Add an action item</h3>
    <div class="two-col"><div><label for="as">Session</label><select id="as" v-model="ni.session"><option value="">Select a completed session</option><option v-for="s in completed" :key="s.id" :value="s.id">{{ other(s).name }} · {{ fmtDT(s.start) }}</option></select></div>
      <div><label for="aw2">Assign to</label><select id="aw2" v-model="ni.who"><option value="student">Student</option><option value="mentor">Mentor</option></select></div></div>
    <label for="at">Task</label><input id="at" v-model="ni.text" placeholder="e.g. Share two example dashboards" />
    <p v-if="ierr" class="error" role="alert">{{ ierr }}</p><button class="btn" :disabled="!completed.length" @click="addI">Add action item</button></section>

  <section class="card" aria-labelledby="lg"><h2 id="lg">Log a past session</h2>
    <div class="two-col"><div><label for="ls">Mentorship</label><select id="ls" v-model="lg.ms"><option v-for="m in ms" :key="m.id" :value="m.id">{{ pair(m) }}</option></select></div>
      <div><label for="ld">Date (not in the future)</label><input id="ld" type="date" :max="todayStr" v-model="lg.date" /></div></div>
    <label for="lt">Time</label><input id="lt" type="time" v-model="lg.time" style="max-width:160px" />
    <label for="ln">Summary</label><textarea id="ln" v-model="lg.notes" rows="3"></textarea>
    <p v-if="lerr" class="error" role="alert">{{ lerr }}</p><button class="btn" :disabled="!ms.length" @click="logIt">Log session</button></section>

  <section class="card" aria-labelledby="hs"><h2 id="hs">History <span class="count">{{ past.length }}</span></h2><p v-if="!past.length" class="muted">Completed sessions will appear here.</p>
    <article v-for="s in past" :key="s.id" class="sess"><div class="row between"><b>{{ other(s).name }} · {{ fmtDT(s.start) }}</b><span class="badge" :class="s.status === 'completed' ? 'accepted' : 'rejected'">{{ s.status }}</span></div>
      <p v-if="s.notes">{{ s.notes }}</p><p class="muted">{{ s.items.length }} action item(s)</p>
      <router-link v-if="s.status === 'completed' && due2(s)" class="btn ghost sm" :to="`/${role}/feedback?session=${s.id}`">Give feedback for this session</router-link>
      <span v-else-if="s.status === 'completed'" class="hint">Feedback sent</span></article></section>

  <ConfirmModal v-if="re" title="Reschedule session" ok="Move session" @ok="doRe" @cancel="re = null">
    <p>Current time: <b>{{ fmtDT(re.start) }}</b>. {{ isStudent ? 'Your mentor will need to confirm the new time.' : 'The student will be notified of the new time.' }}</p>
    <label for="rs">New slot</label><select id="rs" v-model="reSlot"><option value="">Select an open slot</option><option v-for="a in reOptions" :key="a.id" :value="a.id">{{ fmtDT(a.start) }} to {{ time(a.end) }}</option></select>
    <p v-if="!reOptions.length" class="hint">No other open slots. {{ isStudent ? 'Ask your mentor to add more.' : 'Add more on the Availability page.' }}</p>
    <p v-if="reErr" class="error" role="alert">{{ reErr }}</p></ConfirmModal>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { state, me, userById, myMentorships, sessionsOf, requestSession, respondSession, cancelSession, rescheduleSession, logNotes, logPastSession, addItem, deleteItem, toggleItem, allItems, feedbackDue, fmtDT, toast } from '../../composables/useStore'
import PageHeader from '../../components/PageHeader.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
const u = computed(me), role = computed(() => u.value.role), isStudent = computed(() => role.value === 'student')
const ms = computed(() => myMentorships(u.value.id)), all = computed(() => sessionsOf(u.value.id)), now = () => Date.now()
const other = s => userById(s.studentId === u.value.id ? s.mentorId : s.studentId), pair = m => `${userById(m.mentorId).name} and ${userById(m.studentId).name}`
const pending = computed(() => all.value.filter(s => s.status === 'requested' && s.start > now() && s.mentorId === u.value.id))
const upcoming = computed(() => all.value.filter(s => ['requested', 'scheduled'].includes(s.status) && s.start > now()))
const due = computed(() => all.value.filter(s => s.status === 'scheduled' && s.start <= now()))
const completed = computed(() => all.value.filter(s => s.status === 'completed').reverse()), past = computed(() => all.value.filter(s => !['requested', 'scheduled'].includes(s.status)).reverse())
const openSlots = computed(() => state.availability.filter(a => a.status === 'open' && a.start > now() && ms.value.some(m => m.mentorId === a.mentorId)).sort((a, b) => a.start - b.start))
const time = t => new Date(t).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
const todayStr = new Date().toISOString().slice(0, 10), draft = reactive({}), err = ref(''), lerr = ref(''), ierr = ref('')
const lg = reactive({ ms: ms.value[0]?.id || '', date: '', time: '10:00', notes: '' }), ni = reactive({ session: '', who: 'student', text: '' })
const items = computed(() => allItems(u.value.id)), mineItems = computed(() => items.value.filter(i => i.assignee === role.value)), theirItems = computed(() => items.value.filter(i => i.assignee !== role.value))
const due2 = s => feedbackDue(u.value.id).some(x => x.id === s.id)
const request = a => { err.value = requestSession(a.id, u.value.id) || ''; if (!err.value) toast('Session requested. Your mentor will confirm it.') }
const answer = (s, ok) => { const e = respondSession(s.id, u.value.id, ok); e ? toast(e, 'err') : toast(ok ? 'Session confirmed' : 'Session declined') }
const cancel = s => { const e = cancelSession(s.id, u.value.id); e ? toast(e, 'err') : toast('Done. The other person was notified.') }
const save = s => { const e = logNotes(s.id, u.value.id, draft[s.id] || ''); e ? toast(e, 'err') : toast('Notes saved') }
const logIt = () => { lerr.value = logPastSession(lg.ms, u.value.id, lg.date, lg.time, lg.notes) || ''; if (!lerr.value) { toast('Session logged'); lg.date = lg.notes = '' } }
const addI = () => { ierr.value = addItem(ni.session, u.value.id, ni.text, ni.who) || ''; if (!ierr.value) { toast('Action item added'); ni.text = '' } }
const tog = i => { const e = toggleItem(i.sessionId, role.value, i.id); if (e) toast(e, 'err') }
const del = i => { const e = deleteItem(i.sessionId, u.value.id, i.id); e ? toast(e, 'err') : toast('Action item deleted') }
const re = ref(null), reSlot = ref(''), reErr = ref('')
const reOptions = computed(() => re.value ? state.availability.filter(a => a.mentorId === re.value.mentorId && a.status === 'open' && a.start > now()).sort((a, b) => a.start - b.start) : [])
const openRe = s => { re.value = s; reSlot.value = ''; reErr.value = '' }
const doRe = () => { reErr.value = reSlot.value ? rescheduleSession(re.value.id, u.value.id, reSlot.value) || '' : 'Choose a new slot.'; if (!reErr.value) { re.value = null; toast('Session rescheduled') } }
</script>
