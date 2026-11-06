<template>
  <div v-if="!m" class="card empty"><p>This mentor could not be found.</p></div>
  <template v-else>
    <h1>Request mentoring from {{ m.name }}</h1><p class="muted">{{ m.title }} at {{ m.company }}</p>
    <form class="card" @submit.prevent="send" novalidate>
      <p class="muted">From {{ u.name }} ({{ u.programme || 'programme not set' }}). You have {{ 3 - pendingOf(u.id).length }} request(s) left. Requests expire after 14 days.</p>
      <label for="msg">Tell {{ m.name.split(' ')[0] }} what you want help with</label>
      <textarea id="msg" v-model="msg" rows="7" aria-describedby="cc"></textarea>
      <p id="cc" :class="ok ? 'muted' : 'error'">{{ msg.trim().length }} / 1500 characters (minimum 50)</p>
      <fieldset v-if="goals.length"><legend>Attach goals (optional)</legend><label v-for="g in goals" :key="g.id" class="inline"><input type="checkbox" :value="g.id" v-model="picked" /> {{ g.title }}</label>
        <p class="hint">The mentor sees attached goals with your request.</p></fieldset>
      <p v-if="pendingOf(u.id).length >= 3" class="note">You have reached the limit of 3 pending requests. Withdraw one to send another.</p>
      <p v-if="err" class="error" role="alert">{{ err }}</p>
      <div class="row"><button class="btn" :disabled="pendingOf(u.id).length >= 3">Send request</button><router-link class="btn ghost" :to="`/student/mentors/${m.id}`">Cancel</router-link></div>
    </form>
  </template>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { state, me, userById, submitRequest, pendingOf, toast } from '../../composables/useStore'
const route = useRoute(), router = useRouter(), u = computed(me), msg = ref(''), err = ref(''), picked = ref([])
const goals = computed(() => state.goals.filter(g => g.studentId === u.value.id))
const m = computed(() => { const x = userById(route.params.mentorId); return x && x.role === 'mentor' ? x : null })
const ok = computed(() => msg.value.trim().length >= 50 && msg.value.trim().length <= 1500)
function send() { err.value = submitRequest(u.value.id, m.value.id, msg.value, picked.value) || ''; if (!err.value) { toast('Request sent to ' + m.value.name); router.push('/student/requests') } }
</script>
