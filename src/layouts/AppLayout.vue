<template>
  <div v-if="user" class="app" :class="{ open }">
    <aside class="side" aria-label="Main navigation">
      <div class="brand">MentorConnect<small>Guidance that moves you forward</small></div>
      <nav><router-link v-for="n in nav" :key="n[0]" :to="n[0]" @click="open = false">{{ n[1] }}<span v-if="n[0] === '/notifications' && unread" class="dot">{{ unread }}</span></router-link></nav>
    </aside>
    <div class="main">
      <header class="top">
        <button class="btn ghost menu" @click="open = !open" aria-label="Toggle menu">Menu</button>
        <span class="who">{{ user.name }} <em class="role">{{ user.role }}</em></span>
        <button class="btn ghost" @click="out">Log out</button>
      </header>
      <main class="content"><router-view :key="$route.fullPath" /></main>
    </div>
    <div v-if="open" class="scrim" @click="open = false"></div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { me, state, logout } from '../composables/useStore'
const router = useRouter(), open = ref(false), user = computed(me)
const NAV = {
  student: [['/student/dashboard', 'Dashboard'], ['/student/mentors', 'Find Mentors'], ['/student/requests', 'My Requests'], ['/student/goals', 'Career Goals'], ['/notifications', 'Notifications'], ['/student/profile', 'Profile']],
  mentor: [['/mentor/dashboard', 'Dashboard'], ['/mentor/requests', 'Incoming Requests'], ['/mentor/mentees', 'My Mentees'], ['/notifications', 'Notifications'], ['/mentor/profile', 'Profile']],
  admin: [['/admin/dashboard', 'Dashboard'], ['/notifications', 'Notifications']]
}
const nav = computed(() => (user.value ? NAV[user.value.role] : []))
const unread = computed(() => (user.value ? state.notifications.filter(n => n.userId === user.value.id && !n.read).length : 0))
const out = async () => { await router.push('/login'); logout() }
</script>
