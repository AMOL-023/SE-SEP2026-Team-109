<template><div class="empty"><span class="empty-ic"><Icon :name="icon" :size="22" /></span><h3>{{ title }}</h3><p class="muted">{{ text }}</p><slot /></div></template>
<script setup>
import Icon from './Icon.vue'
defineProps({ icon: { type: String, default: 'inbox' }, title: String, text: String })
</script>
