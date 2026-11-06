<template>
  <section class="card"><div class="filters ufilters"><div><label for="q">Search users</label><div class="searchbox"><Icon name="search" :size="16" /><input id="q" v-model="q" placeholder="Name or email" /></div></div>
    <div><label for="r">Role</label><select id="r" v-model="role"><option value="">All roles</option><option>student</option><option>mentor</option><option>coordinator</option></select></div></div>
    <div class="scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      <tr v-for="x in users" :key="x.id"><td><span class="person"><Avatar :name="x.name" :size="28" />{{ x.name }}</span></td><td>{{ x.email }}</td><td>{{ x.role }}</td>
        <td><span class="badge" :class="st(x)[1]">{{ st(x)[0] }}</span></td>
        <td class="row"><button v-if="x.role === 'mentor' && !x.verified && !x.purged" class="btn sm" @click="verify(x)">Verify</button>
          <button v-if="!x.purged" class="btn ghost sm" @click="ask = x">{{ x.active === false ? 'Unblock' : 'Block' }}</button></td></tr>
      <tr v-if="!users.length"><td colspan="5">No users match your search.</td></tr></tbody></table></div>
    <div class="row" style="margin-top:12px"><button class="btn ghost sm" @click="purge">Run retention purge now (demo)</button><span class="hint">Accounts marked for deletion are normally anonymised after {{ RETENTION_DAYS }} days.</span></div></section>
  <section class="card" aria-labelledby="au"><h2 id="au">Audit log</h2><ul class="plain"><li v-for="a in state.audit.slice(0, 8)" :key="a.id">{{ a.text }}<br /><span class="muted">{{ a.actor }} · {{ fmt(a.at) }}</span></li></ul></section>
  <ConfirmModal v-if="ask" :title="(ask.active === false ? 'Unblock ' : 'Block ') + ask.name + '?'" :ok="ask.active === false ? 'Unblock' : 'Block'" :danger="ask.active !== false" @ok="toggle" @cancel="ask = null">
    <p>{{ ask.active === false ? 'They will be able to sign in again.' : 'They can no longer sign in or appear in the directory. Their pending requests are closed, the change is logged and affected people are notified.' }}</p></ConfirmModal>
</template>
<script setup>
import { ref, computed } from 'vue'
import { state, me, setActive, verifyMentor, runPurge, toast, RETENTION_DAYS } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
import Icon from '../Icon.vue'
import Avatar from '../Avatar.vue'
import ConfirmModal from '../ConfirmModal.vue'
const q = ref(''), role = ref(''), ask = ref(null)
const users = computed(() => state.users.filter(u => u.role !== 'admin' && (!role.value || u.role === role.value) && (u.name + u.email).toLowerCase().includes(q.value.toLowerCase())))
const st = u => u.purged ? ['Anonymised', ''] : u.deletionRequestedAt ? ['Deletion requested', 'pending'] : u.active === false ? ['Blocked', 'rejected'] : u.role === 'mentor' && !u.verified ? ['Unverified', 'pending'] : ['Active', 'accepted']
const verify = x => { const e = verifyMentor(x.id, me()); e ? toast(e, 'err') : toast(x.name + ' verified') }
const toggle = () => { setActive(ask.value.id, ask.value.active === false, me()); toast(ask.value.name + (ask.value.active === false ? ' unblocked' : ' blocked')); ask.value = null }
const purge = () => { const n = runPurge(true); toast(n ? n + ' account(s) anonymised' : 'No accounts are awaiting purge') }
</script>
