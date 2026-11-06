<template>
  <router-view />
  <div class="toasts" aria-live="polite"><div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">{{ t.msg }}</div></div>
</template>
<script setup>
import { toasts } from './composables/useStore'
</script>
