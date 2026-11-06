<template><span class="avatar" :style="{ width: size + 'px', height: size + 'px', background: tint[0], color: tint[1], fontSize: size * 0.38 + 'px' }" aria-hidden="true">{{ initials }}</span></template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ name: { type: String, default: '' }, size: { type: Number, default: 40 } })
const TINTS = [['#CDEDEE', '#0B6A73'], ['#FFE6B8', '#7A4A00'], ['#D6EFDF', '#1F6B45'], ['#D7E3F7', '#1F4E8C'], ['#FADADD', '#9B2335']]
const initials = computed(() => props.name.replace(/^Dr\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join(''))
const tint = computed(() => TINTS[[...props.name].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length])
</script>
