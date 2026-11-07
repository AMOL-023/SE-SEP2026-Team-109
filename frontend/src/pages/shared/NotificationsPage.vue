<template>
  <PageHeader title="Notifications" desc="Updates about requests, decisions and your account."><button class="btn ghost" :disabled="!unread" @click="all">Mark all as read</button></PageHeader>
  <EmptyState v-if="!mine.length" icon="bell" title="No notifications yet" text="When a request is sent, answered or expires, you will see it here." />
  <ul class="plain"><li v-for="n in mine" :key="n.id" class="card note-item" :class="{ unread: !n.read }">
    <span class="n-ic"><Icon name="bell" :size="16" /></span>
    <div class="n-body"><button class="linkbtn" @click="open(n)">{{ n.text }}</button><span class="muted">{{ fmt(n.at) }}<template v-if="!n.read"> · Unread</template></span></div><button v-if="!n.read" class="btn ghost sm" @click="n.read = true" :aria-label="'Mark as read: ' + n.text">Mark as read</button></li></ul>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { state, me } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
import PageHeader from '../../components/PageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import Icon from '../../components/Icon.vue'
const router = useRouter()
const mine = computed(() => state.notifications.filter(n => n.userId === me().id).sort((a, b) => b.at - a.at))
const unread = computed(() => mine.value.filter(n => !n.read).length)
const all = () => mine.value.forEach(n => (n.read = true))
const open = n => { n.read = true; if (n.link) router.push(n.link) }
</script>
