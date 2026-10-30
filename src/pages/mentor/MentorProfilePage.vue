<template>
  <div class="row between"><h1>My mentor profile</h1><button v-if="!edit" class="btn" @click="start">Edit profile</button></div>
  <p v-if="!u.title" class="note">Students cannot find you until you complete this profile.</p>
  <div class="card">
    <form v-if="edit" @submit.prevent="save" novalidate>
      <label for="t">Job title</label><input id="t" v-model="f.title" />
      <label for="c">Company</label><input id="c" v-model="f.company" />
      <label for="y">Years of experience</label><input id="y" type="number" min="0" max="50" v-model.number="f.years" />
      <label for="in">Industry</label><input id="in" v-model="f.industry" />
      <label for="b">Biography</label><textarea id="b" v-model="f.bio" rows="4"></textarea>
      <label for="x">Expertise (up to 6, comma separated)</label><input id="x" v-model="f.expertise" />
      <label for="s">Support offered (comma separated)</label><input id="s" v-model="f.support" />
      <p v-for="e in errs" :key="e" class="error" role="alert">{{ e }}</p>
      <div class="row"><button class="btn">Save changes</button><button type="button" class="btn ghost" @click="edit = false">Cancel</button></div>
    </form>
    <dl v-else class="kv"><dt>Name</dt><dd>{{ u.name }}</dd><dt>Role</dt><dd>{{ u.title || 'Not set' }} {{ u.company ? 'at ' + u.company : '' }}</dd><dt>Experience</dt><dd>{{ u.years }} years</dd>
      <dt>Industry</dt><dd>{{ u.industry || 'Not set' }}</dd><dt>Biography</dt><dd>{{ u.bio || 'Not set' }}</dd><dt>Expertise</dt><dd>{{ u.expertise.join(', ') || 'Not set' }}</dd><dt>Support</dt><dd>{{ u.support.join(', ') || 'Not set' }}</dd></dl>
  </div>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { me, toast } from '../../composables/useStore'
import { list } from '../../utils/helpers'
const u = computed(me), edit = ref(false), errs = ref([]), f = reactive({})
const start = () => { Object.assign(f, { title: u.value.title, company: u.value.company, years: u.value.years, industry: u.value.industry, bio: u.value.bio, expertise: u.value.expertise.join(', '), support: u.value.support.join(', ') }); errs.value = []; edit.value = true }
function save() {
  const e = [], x = list(f.expertise)
  if (f.title.trim().length < 2) e.push('Enter your job title.')
  if (f.company.trim().length < 2) e.push('Enter your company or institution.')
  if (!(f.years >= 0 && f.years <= 50)) e.push('Years of experience must be between 0 and 50.')
  if (!f.industry.trim()) e.push('Enter your industry.')
  if (f.bio.trim().length < 30) e.push('Write a biography of at least 30 characters.')
  if (x.length < 1 || x.length > 6) e.push('Add between 1 and 6 expertise areas.')
  if (!list(f.support).length) e.push('List at least one type of support you offer.')
  errs.value = e
  if (e.length) return
  Object.assign(u.value, { title: f.title.trim(), company: f.company.trim(), years: f.years, industry: f.industry.trim(), bio: f.bio.trim(), expertise: x, support: list(f.support) })
  edit.value = false; toast('Profile saved. Students can now find you.')
}
</script>
