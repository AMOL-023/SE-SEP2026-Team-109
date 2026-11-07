<template>
  <div class="grid two">
    <section class="card" aria-labelledby="acd"><h2 id="acd">Account details</h2>
      <div class="row" style="margin-bottom:10px"><Avatar :name="u.name" :photo="u.photo" :size="72" />
        <div><label for="ph" style="margin-top:0">Profile photo</label><input id="ph" type="file" accept="image/png,image/jpeg,image/webp" @change="pick" />
          <button v-if="u.photo" type="button" class="btn ghost sm" style="margin-top:6px" @click="setPhoto(u.id, '')">Remove photo</button></div></div>
      <p v-if="perr" class="error" role="alert">{{ perr }}</p>
      <label for="un">Username</label><div class="pwrow"><input id="un" v-model="un" autocomplete="username" /><button type="button" class="btn sm" @click="saveUn">Save username</button></div>
      <p class="hint">3 to 20 lowercase letters, numbers or underscores. Used if students are shown anonymously later.</p>
      <p v-if="uerr" class="error" role="alert">{{ uerr }}</p>
      <label>Email</label><input :value="u.email" disabled /><p class="hint">Your email cannot be changed.</p></section>
    <ChangePassword />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { me, setUsername, setPhoto, toast } from '../composables/useStore'
import { resizeImage } from '../utils/helpers'
import Avatar from './Avatar.vue'
import ChangePassword from './ChangePassword.vue'
const u = computed(me), un = ref(u.value.username || ''), uerr = ref(''), perr = ref('')
const saveUn = () => { uerr.value = setUsername(u.value.id, un.value) || ''; if (!uerr.value) toast('Username saved') }
async function pick(e) { perr.value = ''; const f = e.target.files[0]; if (!f) return; try { setPhoto(u.value.id, await resizeImage(f)); toast('Photo updated') } catch (x) { perr.value = x.message } e.target.value = '' }
</script>
