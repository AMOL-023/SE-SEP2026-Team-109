<template>
  <ConfirmModal title="Suggest a tag" ok="Send suggestion" @ok="send" @cancel="$emit('close')">
    <p class="muted">Missing a topic? Suggest it and an administrator will approve it. Once approved it appears for everyone.</p>
    <label for="stg">Tag name</label><input id="stg" v-model="name" maxlength="40" placeholder="e.g. Cloud Computing" @keydown.enter.prevent="send" />
    <p v-if="err" class="error" role="alert">{{ err }}</p>
  </ConfirmModal>
</template>
<script setup>
import { ref } from 'vue'
import { suggestTag, toast } from '../composables/useStore'
import ConfirmModal from './ConfirmModal.vue'
const emit = defineEmits(['close']), name = ref(''), err = ref('')
const send = () => { err.value = suggestTag(name.value) || ''; if (!err.value) { toast('Tag suggested for admin approval'); emit('close') } }
</script>
