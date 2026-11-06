<template>
  <AuthLayout>
    <h1 class="auth-h">Sign in to your workspace</h1>
    <div class="seg four" role="group" aria-label="Sign in as">
      <button v-for="r in roles" :key="r[0]" type="button" :class="{ on: role === r[0] }" :aria-pressed="role === r[0]" @click="role = r[0]"><Icon :name="r[2]" :size="16" /> {{ r[1] }}</button></div>
    <p class="rolecopy">{{ copy[role] }}</p>
    <form @submit.prevent="go()" novalidate>
      <label for="em">Email</label><input id="em" v-model="email" type="email" autocomplete="username" :placeholder="role === 'student' ? 'you@ds.study.iitm.ac.in' : 'you@example.com'" />
      <PasswordField id="pw" v-model="pw" label="Password" autocomplete="current-password" />
      <p v-if="err" class="error" role="alert">{{ err }}</p>
      <button class="btn block lg">Sign in</button>
    </form>
    <button class="btn ghost block" @click="go(demo[role], 'Demo1234')">Explore with the demo {{ role }} account</button>
    <p class="muted center">New to MentorConnect? <router-link to="/register">Create an account</router-link></p>
  </AuthLayout>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '../../layouts/AuthLayout.vue'
import Icon from '../../components/Icon.vue'
import PasswordField from '../../components/PasswordField.vue'
import { login } from '../../composables/useStore'
import { emailOk, home } from '../../utils/helpers'
const router = useRouter(), email = ref(''), pw = ref(''), err = ref(''), role = ref('student')
const roles = [['student', 'Student', 'graduation'], ['mentor', 'Mentor', 'heart'], ['coordinator', 'Coordinator', 'users'], ['admin', 'Admin', 'shield']]
const copy = { student: 'Find an alumnus who has been where you are headed.', mentor: 'Share your experience, with the limits you set.', coordinator: 'Spot gaps, follow up on stalled requests and help students find a match.', admin: 'Keep the programme healthy and responsive.' }
const demo = { student: 'student@mentorconnect.demo', mentor: 'mentor@mentorconnect.demo', coordinator: 'coordinator@mentorconnect.demo', admin: 'admin@mentorconnect.demo' }
function go(e = email.value, p = pw.value) {
  err.value = ''
  if (!emailOk(e)) return (err.value = 'Enter a valid email address.')
  if (!p) return (err.value = 'Enter your password.')
  const res = login(e, p)
  if (res.error) return (err.value = res.error)
  router.push(home(res.user.role))
}
</script>
