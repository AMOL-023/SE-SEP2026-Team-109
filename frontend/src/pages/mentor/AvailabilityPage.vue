<template>
  <PageHeader title="Availability" desc="Offer time slots for your mentees. Past slots cannot be offered, slots cannot overlap, and slots with a request or booking are locked." />
  <section class="card" aria-labelledby="ad"><h2 id="ad">Add a slot</h2>
    <div class="two-col"><div><label for="st">Start</label><input id="st" type="datetime-local" :min="minNow" v-model="n.start" /></div><div><label for="en">End</label><input id="en" type="datetime-local" :min="n.start || minNow" v-model="n.end" /></div></div>
    <p v-if="err" class="error" role="alert">{{ err }}</p><button class="btn" @click="add">Add slot</button></section>
  <section class="card" aria-labelledby="sl"><h2 id="sl">Upcoming slots <span class="count">{{ slots.length }}</span></h2>
    <p v-if="!slots.length" class="muted">No slots yet. Add one above so mentees can request them.</p>
    <article v-for="a in slots" :key="a.id" class="sess row between"><span><b>{{ fmtDT(a.start) }}</b> to {{ new Date(a.end).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) }}</span>
      <span class="row"><span class="badge" :class="a.status === 'open' ? 'accepted' : 'pending'">{{ a.status === 'booked' ? 'Booked by ' + booker(a) : a.status === 'pending' ? 'Requested by ' + booker(a) : 'Open' }}</span>
        <template v-if="a.status === 'open'"><button class="btn ghost sm" @click="edit(a)">Edit</button><button class="btn ghost sm" @click="ask = a">Remove</button></template>
        <router-link v-else class="btn ghost sm" to="/mentor/sessions">{{ a.status === 'pending' ? 'Reply to request' : 'Manage or reschedule' }}</router-link></span>
      <span v-if="a.status !== 'open'" class="hint" style="flex-basis:100%">Locked: reschedule or cancel the session first to change this slot. The student is notified.</span></article></section>
  <ConfirmModal v-if="ed" title="Edit slot" ok="Save" @ok="save" @cancel="ed = null"><label for="es">Start</label><input id="es" type="datetime-local" :min="minNow" v-model="d.start" /><label for="ee">End</label><input id="ee" type="datetime-local" v-model="d.end" /><p v-if="eerr" class="error" role="alert">{{ eerr }}</p></ConfirmModal>
  <ConfirmModal v-if="ask" title="Remove this slot?" ok="Remove" danger @ok="remove" @cancel="ask = null"><p>{{ fmtDT(ask.start) }}</p></ConfirmModal>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { state, me, userById, addSlot, updateSlot, removeSlot, fmtDT, toast } from '../../composables/useStore'
import PageHeader from '../../components/PageHeader.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
const u = computed(me), n = reactive({ start: '', end: '' }), d = reactive({ start: '', end: '' }), err = ref(''), eerr = ref(''), ed = ref(null), ask = ref(null)
const pad = x => String(x).padStart(2, '0'), loc = t => { const x = new Date(t); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}` }
const minNow = loc(Date.now())
const slots = computed(() => state.availability.filter(a => a.mentorId === u.value.id && a.end > Date.now()).sort((a, b) => a.start - b.start))
const booker = a => { const s = state.sessions.find(x => x.id === a.sessionId); return s ? userById(s.studentId).name : 'a student' }
const add = () => { err.value = addSlot(u.value.id, n.start, n.end) || ''; if (!err.value) { toast('Slot added'); n.start = n.end = '' } }
const edit = a => { ed.value = a; eerr.value = ''; d.start = loc(a.start); d.end = loc(a.end) }
const save = () => { eerr.value = updateSlot(ed.value.id, u.value.id, d.start, d.end) || ''; if (!eerr.value) { ed.value = null; toast('Slot updated') } }
const remove = () => { const e = removeSlot(ask.value.id, u.value.id); ask.value = null; e ? toast(e, 'err') : toast('Slot removed') }
</script>
