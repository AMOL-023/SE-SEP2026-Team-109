<template>
  <h1>Programme overview</h1><p class="muted">Aggregated figures only. Request messages are not shown to admins.</p>
  <div class="grid stats">
    <div class="card"><p class="muted">Students</p><p class="big">{{ n('student') }}</p></div><div class="card"><p class="muted">Mentors</p><p class="big">{{ n('mentor') }}</p></div>
    <div class="card"><p class="muted">Active mentorships</p><p class="big">{{ state.mentorships.filter(m => m.active).length }}</p></div>
    <div class="card"><p class="muted">Pending requests</p><p class="big">{{ rc('pending') }}</p></div>
    <div class="card"><p class="muted">Acceptance rate</p><p class="big">{{ rate }}</p><span class="muted">of decided requests</span></div>
    <div class="card"><p class="muted">Expired requests</p><p class="big">{{ rc('expired') }}</p></div>
  </div>
  <section class="card"><h2>User management</h2>
    <div class="filters"><div><label for="q">Search users</label><input id="q" v-model="q" placeholder="Name or email" /></div>
      <div><label for="r">Role</label><select id="r" v-model="role"><option value="">All</option><option>student</option><option>mentor</option></select></div></div>
    <div class="scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead><tbody>
      <tr v-for="x in users" :key="x.id"><td>{{ x.name }}</td><td>{{ x.email }}</td><td>{{ x.role }}</td><td>{{ x.active === false ? 'Deactivated' : 'Active' }}</td>
        <td><button class="btn ghost sm" @click="ask = x">{{ x.active === false ? 'Reactivate' : 'Deactivate' }}</button></td></tr>
      <tr v-if="!users.length"><td colspan="5">No users match your search.</td></tr></tbody></table></div></section>
  <ConfirmModal v-if="ask" :title="(ask.active === false ? 'Reactivate ' : 'Deactivate ') + ask.name + '?'" :ok="ask.active === false ? 'Reactivate' : 'Deactivate'" :danger="ask.active !== false" @ok="toggle" @cancel="ask = null">
    <p>{{ ask.active === false ? 'They will be able to log in again.' : 'They will no longer be able to log in or appear in the directory. Their pending requests are closed.' }}</p></ConfirmModal>
</template>
<script setup>
import { ref, computed } from 'vue'
import { state, toast, notify } from '../../composables/useStore'
import ConfirmModal from '../../components/ConfirmModal.vue'
const q = ref(''), role = ref(''), ask = ref(null)
const n = r => state.users.filter(u => u.role === r).length, rc = s => state.requests.filter(r => r.status === s).length
const rate = computed(() => { const a = rc('accepted'), t = a + rc('rejected'); return t ? Math.round(a / t * 100) + '%' : 'n/a' })
const users = computed(() => state.users.filter(u => u.role !== 'admin' && (!role.value || u.role === role.value) && (u.name + u.email).toLowerCase().includes(q.value.toLowerCase())))
function toggle() {
  const u = ask.value; u.active = u.active === false
  if (u.active === false) state.requests.filter(r => r.status === 'pending' && (r.mentorId === u.id || r.studentId === u.id)).forEach(r => { r.history.push({ from: 'pending', to: 'withdrawn', actor: 'Admin', at: Date.now() }); r.status = 'withdrawn'; notify(r.studentId, 'A request was closed by an admin action', '/student/requests') })
  toast(u.name + (u.active === false ? ' deactivated' : ' reactivated')); ask.value = null
}
</script>
