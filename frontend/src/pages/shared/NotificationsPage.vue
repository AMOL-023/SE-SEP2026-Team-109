<template>
  <div class="row between"><h1>Notifications</h1><button class="btn ghost" :disabled="!unread" @click="all">Mark all as read</button></div>
  <div v-if="!mine.length" class="card empty"><p>No notifications yet. Updates about your requests will appear here.</p></div>
  <ul class="plain"><li v-for="n in mine" :key="n.id" class="card note-item" :class="{ unread: !n.read }">
    <button class="linkbtn" @click="open(n)">{{ n.text }}</button><span class="muted">{{ fmt(n.at) }}<template v-if="!n.read"> (unread)</template></span></li></ul>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { state, me } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
const router = useRouter()
const mine = computed(() => state.notifications.filter(n => n.userId === me().id).sort((a, b) => b.at - a.at))
const unread = computed(() => mine.value.filter(n => !n.read).length)
const all = () => mine.value.forEach(n => (n.read = true))
const open = n => { n.read = true; if (n.link) router.push(n.link) }
</script>
