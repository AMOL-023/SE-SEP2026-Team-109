<template>
  <div class="row between"><h1>My mentor profile</h1><button v-if="!edit" class="btn" @click="start">Edit profile</button></div>
  <p v-if="!u.title" class="note">Students cannot find you until you complete this profile.</p>
  <p v-else-if="!u.verified" class="note">Your profile is complete and waiting for admin verification. Students cannot see it yet.</p>
  <p v-else class="note"><span class="badge accepted">Verified</span> Your profile is visible to students.</p>
  <div class="card">
    <form v-if="edit" @submit.prevent="save" novalidate>
      <label for="t">Job title</label><input id="t" v-model="f.title" />
      <label for="c">Company</label><input id="c" v-model="f.company" />
      <label for="y">Years of experience</label><input id="y" type="number" min="0" max="50" v-model.number="f.years" />
      <div class="two-col"><div><label for="ca">Career area</label><select id="ca" v-model="f.careerArea"><option value="">Select</option><option v-for="a in CAREER_AREAS" :key="a">{{ a }}</option></select></div>
        <div><label for="in">Industry</label><input id="in" v-model="f.industry" /></div></div>
      <label for="b">Biography</label><textarea id="b" v-model="f.bio" rows="4"></textarea>
      <fieldset><legend>Expertise (choose up to 6) · {{ f.expertise.length }} selected</legend>
        <div class="chipset"><button v-for="t in tags" :key="t" type="button" class="chipbtn" :class="{ on: f.expertise.includes(t) }" :aria-pressed="f.expertise.includes(t)" @click="pick(t)">{{ t }}</button></div>
        <button type="button" class="btn ghost sm" style="margin-top:8px" @click="sugg = true">Suggest a tag</button>
        <p class="hint">Suggested tags need admin approval before they appear for everyone.</p></fieldset>
      <fieldset><legend>Capacity</legend><label for="cap">Maximum mentees (1 to 10)</label><input id="cap" type="number" min="1" max="10" v-model.number="f.capacity" style="max-width:120px" /></fieldset>
      <label for="s">Support offered (comma separated)</label><input id="s" v-model="f.support" />
      <p v-for="e in errs" :key="e" class="error" role="alert">{{ e }}</p>
      <div class="row"><button class="btn">Save changes</button><button type="button" class="btn ghost" @click="edit = false">Cancel</button></div>
    </form>
    <dl v-else class="kv"><dt>Name</dt><dd>{{ u.name }}</dd><dt>Role</dt><dd>{{ u.title || 'Not set' }} {{ u.company ? 'at ' + u.company : '' }}</dd><dt>Experience</dt><dd>{{ u.years }} years</dd><dt>IITM</dt><dd>{{ u.completed || 'Not set' }}{{ u.gradYear ? ', ' + u.gradYear : '' }}</dd><dt>LinkedIn</dt><dd>{{ u.linkedin || 'Not set' }}</dd>
      <dt>Username</dt><dd>{{ u.username || 'Not set' }}</dd><dt>Career area</dt><dd>{{ u.careerArea || 'Not set' }}</dd><dt>Industry</dt><dd>{{ u.industry || 'Not set' }}</dd><dt>Biography</dt><dd>{{ u.bio || 'Not set' }}</dd><dt>Expertise</dt><dd>{{ u.expertise.join(', ') || 'Not set' }}</dd><dt>Capacity</dt><dd>{{ u.capacity }} mentees</dd><dt>Support</dt><dd>{{ u.support.join(', ') || 'Not set' }}</dd></dl>
  </div>
  <AccountExtras />
  <SuggestTagModal v-if="sugg" @close="sugg = false" />
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { me, toast, approvedTags } from '../../composables/useStore'
import { list, CAREER_AREAS } from '../../utils/helpers'
import AccountExtras from '../../components/AccountExtras.vue'
import SuggestTagModal from '../../components/SuggestTagModal.vue'
const u = computed(me), edit = ref(false), errs = ref([]), f = reactive({}), sugg = ref(false), tags = computed(approvedTags)
const pick = t => { const i = f.expertise.indexOf(t); if (i >= 0) f.expertise.splice(i, 1); else if (f.expertise.length < 6) f.expertise.push(t); else toast('You can choose up to 6 expertise areas.', 'err') }
const start = () => { Object.assign(f, { title: u.value.title, company: u.value.company, years: u.value.years, careerArea: u.value.careerArea || '', industry: u.value.industry, bio: u.value.bio, expertise: [...u.value.expertise], capacity: u.value.capacity, support: u.value.support.join(', ') }); errs.value = []; edit.value = true }
function save() {
  const e = [], x = f.expertise
  if (f.title.trim().length < 2) e.push('Enter your job title.')
  if (f.company.trim().length < 2) e.push('Enter your company or institution.')
  if (!(f.years >= 0 && f.years <= 50)) e.push('Years of experience must be between 0 and 50.')
  if (!f.careerArea) e.push('Select your career area.')
  if (!f.industry.trim()) e.push('Enter your industry.')
  if (f.bio.trim().length < 30) e.push('Write a biography of at least 30 characters.')
  if (x.length < 1 || x.length > 6) e.push('Add between 1 and 6 expertise areas.')
  if (!list(f.support).length) e.push('List at least one type of support you offer.')
  if (!(f.capacity >= 1 && f.capacity <= 10)) e.push('Capacity must be between 1 and 10.')
  errs.value = e
  if (e.length) return
  Object.assign(u.value, { capacity: f.capacity, title: f.title.trim(), company: f.company.trim(), years: f.years, careerArea: f.careerArea, industry: f.industry.trim(), bio: f.bio.trim(), expertise: x, support: list(f.support) })
  edit.value = false; toast('Profile saved. Students can now find you.')
}
</script>
