<template>
  <div class="modal-wrap" @click.self="$emit('cancel')" @keydown.esc="$emit('cancel')">
    <div ref="box" class="modal" role="dialog" aria-modal="true" :aria-label="title" tabindex="-1">
      <h2>{{ title }}</h2><slot />
      <div class="row end"><button class="btn ghost" @click="$emit('cancel')">Cancel</button>
        <button class="btn" :class="{ danger }" @click="$emit('ok')">{{ ok || 'Confirm' }}</button></div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
defineProps({ title: String, ok: String, danger: Boolean })
defineEmits(['ok', 'cancel'])
const box = ref(null)
onMounted(() => box.value && box.value.focus())
</script>
