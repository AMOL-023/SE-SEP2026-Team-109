<template>
  <section class="card" aria-labelledby="cpw"><h2 id="cpw">Change password</h2>
    <form @submit.prevent="save" novalidate>
      <PasswordField id="cp0" v-model="cur" label="Current password" autocomplete="current-password" />
      <PasswordField id="cp1" v-model="nw" label="New password" autocomplete="new-password" />
      <PasswordField id="cp2" v-model="cf" label="Confirm new password" autocomplete="new-password" />
      <p class="hint">At least 8 characters, with letters and numbers.</p>
      <p v-if="err" class="error" role="alert">{{ err }}</p>
      <button class="btn">Update password</button>
    </form></section>
</template>
<script setup>
import { ref } from 'vue'
import { me, changePassword, toast } from '../composables/useStore'
import PasswordField from './PasswordField.vue'
const cur = ref(''), nw = ref(''), cf = ref(''), err = ref('')
function save() {
  err.value = !cur.value ? 'Enter your current password.' : nw.value !== cf.value ? 'The new passwords do not match.' : changePassword(me().id, cur.value, nw.value) || ''
  if (!err.value) { toast('Password updated'); cur.value = nw.value = cf.value = '' }
}
</script>
