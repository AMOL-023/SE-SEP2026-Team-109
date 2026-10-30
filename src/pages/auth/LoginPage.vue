<template>
  <AuthLayout>
    <h2>Log in</h2>
    <form @submit.prevent="go()" novalidate>
      <label for="em">Email</label><input id="em" v-model="email" type="email" autocomplete="username" />
      <label for="pw">Password</label>
      <div class="row"><input id="pw" v-model="pw" :type="show ? 'text' : 'password'" autocomplete="current-password" />
        <button type="button" class="btn ghost" @click="show = !show">{{ show ? 'Hide' : 'Show' }}</button></div>
      <p v-if="err" class="error" role="alert">{{ err }}</p>
      <button class="btn block">Log in</button>
    </form>
    <p class="muted">New here? <router-link to="/register">Create an account</router-link></p>
    <div class="demo"><p class="muted">Demo accounts (password Demo1234)</p>
      <div class="row"><button class="btn ghost" @click="go('student@mentorconnect.demo', 'Demo1234')">Student</button>
        <button class="btn ghost" @click="go('mentor@mentorconnect.demo', 'Demo1234')">Mentor</button>
        <button class="btn ghost" @click="go('admin@mentorconnect.demo', 'Demo1234')">Admin</button></div></div>
  </AuthLayout>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '../../layouts/AuthLayout.vue'
import { login } from '../../composables/useStore'
import { emailOk, home } from '../../utils/helpers'
const router = useRouter(), email = ref(''), pw = ref(''), show = ref(false), err = ref('')
function go(e = email.value, p = pw.value) {
  err.value = ''
  if (!emailOk(e)) return (err.value = 'Enter a valid email address.')
  if (!p) return (err.value = 'Enter your password.')
  const res = login(e, p)
  if (res.error) return (err.value = res.error)
  router.push(home(res.user.role))
}
</script>
