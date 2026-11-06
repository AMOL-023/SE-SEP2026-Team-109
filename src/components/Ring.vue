<template>
  <span class="ring" :style="{ width: size + 'px', height: size + 'px' }" role="img" :aria-label="pct + ' percent complete'">
    <svg :width="size" :height="size" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" fill="none" stroke="#D8F0F0" stroke-width="3.5" />
      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0E7C86" stroke-width="3.5" stroke-linecap="round" pathLength="100" :stroke-dasharray="pct + ' 100'" transform="rotate(-90 18 18)" /></svg>
    <b>{{ pct }}%</b>
  </span>
</template>
<script setup>
defineProps({ pct: { type: Number, default: 0 }, size: { type: Number, default: 92 } })
</script>
