<template>
  <PageHeader title="Sessions" desc="Book time, log what was discussed, and track agreed action items. Only the two participants can see a session." />
  <p v-if="!ms.length" class="card empty">You need an active mentorship before you can book or log sessions.</p>
  <section v-if="isStudent && ms.length" class="card" aria-labelledby="bk"><h2 id="bk">Book a session</h2>
    <p class="muted">You can only see availability for mentors you are currently matched with.</p>
    <p v-if="!openSlots.length" class="muted">No open slots right now. Ask your mentor to add some.</p>
    <ul class="plain"><li v-for="a in openSlots" :key="a.id" class="row between"><span><b>{{ userById(a.mentorId).name }}</b> · {{ fmtDT(a.start) }} to {{ time(a.end) }}</span><button class="btn sm" @click="book(a)">Book</button></li></ul>
    <p v-if="err" class="error" role="alert">{{ err }}</p></section>
  <section class="card" aria-labelledby="up"><h2 id="up">Upcoming <span class="count">{{ upcoming.length }}</span></h2>
    <p v-if="!upcoming.length" class="muted">Nothing scheduled.</p>
    <article v-for="s in upcoming" :key="s.id" class="sess"><div class="row between"><b>{{ other(s).name }} · {{ fmtDT(s.start) }}</b><span class="badge pending">Scheduled</span></div>
      <button class="btn ghost sm" @click="cancel(s)">Cancel session</button></article></section>
  <section class="card" aria-labelledby="aw"><h2 id="aw">Awaiting notes <span class="count">{{ due.length }}</span></h2>
    <p class="muted">These sessions have started. Add a short summary to complete them.</p><p v-if="!due.length" class="muted">All caught up.</p>
    <article v-for="s in due" :key="s.id" class="sess"><b>{{ other(s).name }} · {{ fmtDT(s.start) }}</b>
      <label :for="'n' + s.id">Summary</label><textarea :id="'n' + s.id" v-model="draft[s.id]" rows="3"></textarea>
      <button class="btn sm" @click="save(s)">Save notes</button></article></section>
  <section class="card" aria-labelledby="lg"><h2 id="lg">Log a past session</h2>
    <div class="two-col"><div><label for="ls">Mentorship</label><select id="ls" v-model="lg.ms"><option v-for="m in ms" :key="m.id" :value="m.id">{{ pair(m) }}</option></select></div>
      <div><label for="ld">Date (not in the future)</label><input id="ld" type="date" :max="todayStr" v-model="lg.date" /></div></div>
    <label for="lt">Time</label><input id="lt" type="time" v-model="lg.time" style="max-width:160px" />
    <label for="ln">Summary</label><textarea id="ln" v-model="lg.notes" rows="3"></textarea>
    <p v-if="lerr" class="error" role="alert">{{ lerr }}</p><button class="btn" :disabled="!ms.length" @click="logIt">Log session</button></section>
  <section class="card" aria-labelledby="hs"><h2 id="hs">History <span class="count">{{ past.length }}</span></h2><p v-if="!past.length" class="muted">Completed sessions will appear here.</p>
    <article v-for="s in past" :key="s.id" class="sess"><div class="row between"><b>{{ other(s).name }} · {{ fmtDT(s.start) }}</b><span class="badge" :class="s.status === 'completed' ? 'accepted' : 'rejected'">{{ s.status }}</span></div>
      <p v-if="s.notes">{{ s.notes }}</p>
      <h3 class="sub">Action items</h3><p v-if="!s.items.length" class="muted">None yet.</p>
      <ul class="plain"><li v-for="i in s.items" :key="i.id"><label class="inline"><input type="checkbox" :checked="i.done" :disabled="i.assignee !== role" @change="tog(s, i)" /> <span :class="{ done: i.done }">{{ i.text }}</span></label> <span class="badge">{{ i.assignee }}</span></li></ul>
      <div v-if="s.status === 'completed'" class="row"><input :aria-label="'New action item for ' + other(s).name" v-model="item[s.id]" placeholder="New action item" style="flex:1;min-width:180px" /><select :aria-label="'Assign to'" v-model="who[s.id]"><option value="student">Student</option><option value="mentor">Mentor</option></select><button class="btn ghost sm" @click="add(s)">Add item</button></div></article></section>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { state, me, userById, myMentorships, sessionsOf, bookSlot, cancelSession, logNotes, logPastSession, addItem, toggleItem, fmtDT, toast } from '../../composables/useStore'
import PageHeader from '../../components/PageHeader.vue'
const u = computed(me), role = computed(() => u.value.role), isStudent = computed(() => role.value === 'student')
const ms = computed(() => myMentorships(u.value.id)), all = computed(() => sessionsOf(u.value.id)), now = () => Date.now()
const other = s => userById(s.studentId === u.value.id ? s.mentorId : s.studentId), pair = m => `${userById(m.mentorId).name} and ${userById(m.studentId).name}`
const upcoming = computed(() => all.value.filter(s => s.status === 'scheduled' && s.start > now())), due = computed(() => all.value.filter(s => s.status === 'scheduled' && s.start <= now()))
const past = computed(() => all.value.filter(s => s.status !== 'scheduled').reverse())
const openSlots = computed(() => state.availability.filter(a => a.status === 'open' && a.start > now() && ms.value.some(m => m.mentorId === a.mentorId)).sort((a, b) => a.start - b.start))
const time = t => new Date(t).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
const todayStr = new Date().toISOString().slice(0, 10), draft = reactive({}), item = reactive({}), who = reactive({}), err = ref(''), lerr = ref('')
const lg = reactive({ ms: ms.value[0]?.id || '', date: '', time: '10:00', notes: '' })
const book = a => { err.value = bookSlot(a.id, u.value.id) || ''; if (!err.value) toast('Session booked') }
const cancel = s => { const e = cancelSession(s.id, u.value.id); e ? toast(e, 'err') : toast('Session cancelled. The other person was notified.') }
const save = s => { const e = logNotes(s.id, u.value.id, draft[s.id] || ''); e ? toast(e, 'err') : toast('Notes saved') }
const logIt = () => { lerr.value = logPastSession(lg.ms, u.value.id, lg.date, lg.time, lg.notes) || ''; if (!lerr.value) { toast('Session logged'); lg.date = lg.notes = '' } }
const add = s => { const e = addItem(s.id, u.value.id, item[s.id] || '', who[s.id] || 'student'); e ? toast(e, 'err') : (item[s.id] = '') }
const tog = (s, i) => { const e = toggleItem(s.id, role.value, i.id); if (e) toast(e, 'err') }
</script>
