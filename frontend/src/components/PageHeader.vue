<template>
  <header class="ph">
    <div>
      <nav v-if="crumbs && crumbs.length" class="crumbs" aria-label="Breadcrumb">
        <template v-for="(c, i) in crumbs" :key="i"><router-link v-if="c[1]" :to="c[1]">{{ c[0] }}</router-link><span v-else aria-current="page">{{ c[0] }}</span><Icon v-if="i < crumbs.length - 1" name="chevron" :size="12" /></template>
      </nav>
      <h1>{{ title }}</h1><p v-if="desc" class="muted">{{ desc }}</p>
    </div>
    <div class="row"><slot /></div>
  </header>
</template>
<script setup>
import Icon from './Icon.vue'
defineProps({ title: String, desc: String, crumbs: Array })
</script>
