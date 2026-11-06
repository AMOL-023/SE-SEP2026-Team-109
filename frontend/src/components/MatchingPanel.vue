<template>
  <div class="grid two">
    <section class="card" aria-labelledby="mp1"><h2 id="mp1">Assign a mentor to a student</h2>
      <p class="muted">{{ isAdmin ? 'Students without an active mentor.' : 'Students are anonymised until matched.' }} Capacity is checked before every assignment.</p>
      <label for="ms">Student</label><select id="ms" v-model="sid"><option value="">Select a student</option><option v-for="s in unmatched" :key="s.id" :value="s.id">{{ label(s) }} · {{ s.programme || 'programme not set' }}</option></select>
      <p v-if="sel" class="hint">Interests: {{ sel.interests.join(', ') || 'none yet' }}</p>
      <label for="mm">Mentor</label><select id="mm" v-model="mid"><option value="">Select a mentor</option><option v-for="m in mentorsList" :key="m.id" :value="m.id" :disabled="openSlots(m) < 1">{{ m.name }} · {{ m.industry }} · {{ openSlots(m) }} of {{ m.capacity }} free{{ m.paused ? ' (paused)' : '' }}</option></select>
      <p v-if="err" class="error" role="alert">{{ err }}</p>
      <button class="btn" :disabled="!sid || !mid" @click="assign">Assign mentor</button>
      <p v-if="!sid || !mid" class="hint">Choose a student and a mentor with a free place to enable this.</p></section>
    <section v-if="!isAdmin" class="card" aria-labelledby="mp2"><h2 id="mp2">Contact a student</h2>
      <p class="muted">Sent as an in-app message. Replies are possible through the anonymised relay address, so the student's real email is never shown.</p>
      <label for="cs">Student</label><select id="cs" v-model="cid"><option value="">Select a student</option><option v-for="s in unmatched" :key="s.id" :value="s.id">{{ label(s) }}</option></select>
      <p v-if="cid" class="hint">Relay address: {{ relayEmail(cid) }}</p>
      <label for="cm">Message</label><textarea id="cm" v-model="msg" rows="4" maxlength="500"></textarea><p class="hint">{{ msg.length }} / 500</p>
      <p v-if="cerr" class="error" role="alert">{{ cerr }}</p>
      <button class="btn" :disabled="!cid" @click="send">Send message</button></section>
    <section v-if="isAdmin" class="card" aria-labelledby="mp3"><h2 id="mp3">Coordinator groups</h2>
      <p class="muted">Assign mentor-mentee pairs to a coordinator for follow-up.</p>
      <div v-for="ms in actives" :key="ms.id" class="row between grp"><span><b>{{ userById(ms.mentorId).name }}</b> with {{ userById(ms.studentId).name }}</span>
        <select :aria-label="'Coordinator for ' + userById(ms.mentorId).name + ' and ' + userById(ms.studentId).name" :value="coordOf(ms.id)" @change="setCoord(ms.id, $event.target.value)"><option value="">Unassigned</option><option v-for="c in coords" :key="c.id" :value="c.id">{{ c.name }}</option></select></div>
      <p v-if="!actives.length" class="muted">No active mentorships yet.</p></section>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { state, me, userById, openSlots, assignMentor, assignGroup, unassignGroup, contactStudent, unmatchedStudents, aliasOf, relayEmail, toast } from '../composables/useStore'
const u = computed(me), isAdmin = computed(() => u.value.role === 'admin')
const sid = ref(''), mid = ref(''), err = ref(''), cid = ref(''), msg = ref(''), cerr = ref('')
const unmatched = computed(unmatchedStudents), sel = computed(() => unmatched.value.find(s => s.id === sid.value))
const mentorsList = computed(() => state.users.filter(m => m.role === 'mentor' && m.title && m.verified && m.active !== false && !m.purged))
const label = s => (isAdmin.value ? s.name : aliasOf(s.id))
const assign = () => { err.value = assignMentor(sid.value, mid.value, u.value) || ''; if (!err.value) { toast('Mentor assigned'); sid.value = mid.value = '' } }
const send = () => { cerr.value = contactStudent(u.value, cid.value, msg.value) || ''; if (!cerr.value) { toast('Message sent'); msg.value = '' } }
const actives = computed(() => state.mentorships.filter(m => m.active)), coords = computed(() => state.users.filter(x => x.role === 'coordinator'))
const coordOf = id => Object.keys(state.groups).find(c => (state.groups[c] || []).includes(id)) || ''
const setCoord = (id, c) => { Object.keys(state.groups).forEach(k => unassignGroup(k, id)); if (c) assignGroup(c, id); toast('Group updated') }
</script>
