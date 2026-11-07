<template>
  <div class="auth2">
    <header class="a-brand"><Icon name="compass" :size="28" /><span>MentorConnect</span><em>Guidance that moves you forward</em></header>
    <div class="a-grid">
      <main class="a-main" id="main"><slot /></main>
      <aside class="a-how" aria-label="How MentorConnect works"><h2>How it works</h2>
        <ol><li><b>Tell us about you</b><span>Share your programme, interests and what you need help with.</span></li>
          <li><b>Ask a mentor</b><span>Browse alumni, see their open places, and send up to 3 requests at a time. Unanswered requests close after 14 days.</span></li>
          <li><b>Work toward your goals</b><span>Keep career goals in one place that your mentor can see.</span></li></ol>
        <p class="muted">Mentors choose how many students they take, so a clear request helps them say yes.</p></aside>
    </div>
  </div>
</template>
<script setup>
import Icon from '../components/Icon.vue'
</script>
