<template>
  <div class="modal-wrap" @keydown.esc="$emit('cancel')">
    <div class="modal" role="dialog" aria-modal="true" :aria-label="title">
      <h2>{{ title }}</h2><slot />
      <div class="row end"><button class="btn ghost" @click="$emit('cancel')">Cancel</button>
        <button class="btn" :class="{ danger }" @click="$emit('ok')">{{ ok || 'Confirm' }}</button></div>
    </div>
  </div>
</template>
<script setup>
defineProps({ title: String, ok: String, danger: Boolean })
defineEmits(['ok', 'cancel'])
</script>
