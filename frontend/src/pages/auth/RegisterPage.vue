<template>
  <AuthLayout>
    <h2>Create your account</h2>
    <form @submit.prevent="submit" novalidate>
      <label for="n">Full name</label><input id="n" v-model="f.name" />
      <label for="e">Email</label><input id="e" v-model="f.email" type="email" />
      <p class="muted">Students must use an email ending in study.iitm.ac.in.</p>
      <label for="p">Password</label><input id="p" v-model="f.password" type="password" autocomplete="new-password" />
      <p class="muted">At least 8 characters with letters and numbers.</p>
      <label for="c">Confirm password</label><input id="c" v-model="f.confirm" type="password" autocomplete="new-password" />
      <fieldset><legend>I am a</legend>
        <label class="inline"><input type="radio" value="student" v-model="f.role" /> Student</label>
        <label class="inline"><input type="radio" value="mentor" v-model="f.role" /> Mentor (alumnus)</label></fieldset>
      <p v-for="e in errs" :key="e" class="error" role="alert">{{ e }}</p>
      <button class="btn block">Register</button>
    </form>
    <p class="muted">Already registered? <router-link to="/login">Log in</router-link></p>
  </AuthLayout>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '../../layouts/AuthLayout.vue'
import { register } from '../../composables/useStore'
import { emailOk, iitmOk, passOk } from '../../utils/helpers'
const router = useRouter(), f = reactive({ name: '', email: '', password: '', confirm: '', role: 'student' }), errs = ref([])
function submit() {
  const e = []
  if (f.name.trim().length < 2) e.push('Enter your full name.')
  if (!emailOk(f.email)) e.push('Enter a valid email address.')
  else if (f.role === 'student' && !iitmOk(f.email)) e.push('Student emails must end with study.iitm.ac.in.')
  if (!passOk(f.password)) e.push('Password needs at least 8 characters, with letters and numbers.')
  if (f.password !== f.confirm) e.push('Passwords do not match.')
  if (!e.length) { const r = register(f); if (r) e.push(r) }
  errs.value = e
  if (!e.length) router.push('/register/success')
}
</script>
