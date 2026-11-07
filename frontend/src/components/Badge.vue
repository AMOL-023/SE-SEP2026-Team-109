<template><span class="badge" :class="s">{{ labels[s] || s }}</span></template>
<script setup>
defineProps({ s: String })
const labels = { pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected', expired: 'Expired', withdrawn: 'Withdrawn' }
</script>
