<template>
  <div v-if="!r" class="card empty"><p>This request could not be found.</p><router-link to="/mentor/requests">Back to requests</router-link></div>
  <template v-else>
    <router-link to="/mentor/requests">Back to requests</router-link>
    <div class="row between"><h1>Request from {{ s.name }}</h1><Badge :s="r.status" /></div>
    <div class="grid two">
      <section class="card"><h2>Student</h2><dl class="kv"><dt>Programme</dt><dd>{{ s.programme }}</dd><dt>Interests</dt><dd>{{ s.interests.join(', ') }}</dd><dt>Needs</dt><dd>{{ s.needs }}</dd><dt>Skills</dt><dd>{{ s.skills.map(k => k.name + ' (L' + k.level + (k.want ? ', learning' : '') + ')').join(', ') || 'None listed' }}</dd>
        <dt>Email</dt><dd>{{ r.status === 'accepted' ? s.email : 'Hidden until you accept' }}</dd></dl></section>
      <section class="card"><h2>Message</h2><p>{{ r.message }}</p><p class="muted">Sent {{ fmt(r.createdAt) }}</p>
        <p class="muted">Your capacity: {{ activeMentees(u.id).length }} of {{ u.capacity }} used.</p>
        <p v-if="r.reason" class="note">Reason given: {{ r.reason }}</p>
        <template v-if="attached.length"><h3 class="sub">Attached goals</h3><ul class="plain"><li v-for="g in attached" :key="g.id">{{ g.title }} <span class="muted">· due {{ g.target }}</span></li></ul></template></section>
    </div>
    <section v-if="r.status === 'pending'" class="card"><h2>Your decision</h2>
      <label for="rs">Reason if rejecting (optional, up to 500 characters)</label><textarea id="rs" v-model="reason" rows="3"></textarea>
      <p v-if="err" class="error" role="alert">{{ err }}</p>
      <div class="row"><button class="btn" @click="ask = 'accepted'">Accept request</button><button class="btn danger" @click="ask = 'rejected'">Reject request</button></div></section>
    <p v-else class="note">This request is {{ r.status }} and can no longer be changed.</p>
    <section class="card"><h2>Status history</h2><RequestTimeline :history="r.history" /></section>
    <ConfirmModal v-if="ask" :title="ask === 'accepted' ? 'Accept this request?' : 'Reject this request?'" :ok="ask === 'accepted' ? 'Accept' : 'Reject'" :danger="ask === 'rejected'" @ok="decideIt" @cancel="ask = null">
      <p>{{ ask === 'accepted' ? 'You and the student will see each other’s email. This uses one of your slots.' : 'The student will be notified. This cannot be undone.' }}</p></ConfirmModal>
  </template>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { state, me, userById, activeMentees, decide, toast } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
import Badge from '../../components/Badge.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
import RequestTimeline from '../../components/RequestTimeline.vue'
const route = useRoute(), u = computed(me), reason = ref(''), err = ref(''), ask = ref(null)
const r = computed(() => state.requests.find(x => x.id === route.params.requestId && x.mentorId === u.value.id))
const s = computed(() => userById(r.value.studentId))
const attached = computed(() => state.goals.filter(g => (r.value.goalIds || []).includes(g.id)))
function decideIt() { const to = ask.value; ask.value = null; err.value = decide(r.value.id, u.value.id, to, to === 'rejected' ? reason.value.trim() : '') || ''; if (!err.value) toast(`Request ${to}`) }
</script>
