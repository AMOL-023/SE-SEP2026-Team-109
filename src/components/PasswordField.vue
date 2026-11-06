<template>
  <div>
    <label :for="id">{{ label }}</label>
    <div class="pwrow">
      <input :id="id" :value="modelValue" :type="show ? 'text' : 'password'" :autocomplete="autocomplete" @input="$emit('update:modelValue', $event.target.value)" />
      <button type="button" class="btn ghost sm pwtoggle" :aria-pressed="show" :aria-label="(show ? 'Hide ' : 'Show ') + label.toLowerCase()" @click="show = !show"><Icon :name="show ? 'eyeoff' : 'eye'" :size="16" /> {{ show ? 'Hide' : 'Show' }}</button>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'
defineProps({ modelValue: { type: String, default: '' }, id: { type: String, required: true }, label: { type: String, default: 'Password' }, autocomplete: { type: String, default: 'current-password' } })
defineEmits(['update:modelValue'])
const show = ref(false)
</script>
