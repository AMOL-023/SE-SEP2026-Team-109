<template><ol class="timeline"><li v-for="(h, i) in history" :key="i"><b>{{ h.to }}</b> <span class="muted">by {{ h.actor }} on {{ fmt(h.at) }}</span></li></ol></template>
<script setup>
import { fmt } from '../utils/helpers'
defineProps({ history: Array })
</script>
