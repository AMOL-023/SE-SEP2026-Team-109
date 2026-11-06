<template><AuthLayout><div class="success"><span class="empty-ic ok"><Icon name="check" :size="24" /></span><h1 class="auth-h">Account created</h1><p class="muted">Sign in next. Student profiles are read by mentors before they reply to a request. Mentor profiles become visible to students once an administrator has verified them.</p><router-link class="btn block lg" to="/login">Continue to sign in</router-link></div></AuthLayout></template>
<script setup>
import AuthLayout from '../../layouts/AuthLayout.vue'
import Icon from '../../components/Icon.vue'
</script>
