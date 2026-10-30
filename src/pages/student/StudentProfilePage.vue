<template>
  <div class="row between"><h1>My profile</h1><button v-if="!edit" class="btn" @click="start">Edit profile</button></div>
  <div class="card"><div class="bar"><i :style="{ width: pct + '%' }"></i></div><p class="muted">Profile {{ pct }}% complete. Mentors see this before they respond.</p>
    <form v-if="edit" @submit.prevent="save" novalidate>
      <label for="n">Full name</label><input id="n" v-model="f.name" />
      <label>Email</label><input :value="u.email" disabled />
      <label for="p">Programme level</label><select id="p" v-model="f.programme"><option value="">Select</option><option v-for="p in progs" :key="p">{{ p }}</option></select>
      <label for="i">Career interests (1 to 5, comma separated)</label><input id="i" v-model="f.interests" />
      <label for="nd">What do you need help with?</label><textarea id="nd" v-model="f.needs" rows="4"></textarea>
      <label for="s">Skills (comma separated)</label><input id="s" v-model="f.skills" />
      <p v-for="e in errs" :key="e" class="error" role="alert">{{ e }}</p>
      <div class="row"><button class="btn">Save changes</button><button type="button" class="btn ghost" @click="edit = false">Cancel</button></div>
    </form>
    <dl v-else class="kv"><dt>Name</dt><dd>{{ u.name }}</dd><dt>Email</dt><dd>{{ u.email }}</dd><dt>Programme</dt><dd>{{ u.programme || 'Not set' }}</dd>
      <dt>Interests</dt><dd>{{ u.interests.join(', ') || 'Not set' }}</dd><dt>Needs</dt><dd>{{ u.needs || 'Not set' }}</dd><dt>Skills</dt><dd>{{ u.skills.join(', ') || 'Not set' }}</dd></dl>
  </div>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { me, toast } from '../../composables/useStore'
import { list } from '../../utils/helpers'
const u = computed(me), edit = ref(false), errs = ref([]), f = reactive({}), progs = ['Foundation', 'Diploma', 'BSc', 'BS Degree']
const pct = computed(() => Math.round([u.value.programme, u.value.interests.length, u.value.needs, u.value.skills.length].filter(Boolean).length * 25))
const start = () => { Object.assign(f, { name: u.value.name, programme: u.value.programme, interests: u.value.interests.join(', '), needs: u.value.needs, skills: u.value.skills.join(', ') }); errs.value = []; edit.value = true }
function save() {
  const e = [], i = list(f.interests)
  if (f.name.trim().length < 2) e.push('Enter your name.')
  if (!f.programme) e.push('Select your programme level.')
  if (i.length < 1 || i.length > 5) e.push('Add between 1 and 5 career interests.')
  if (f.needs.trim().length < 20) e.push('Describe your mentoring needs in at least 20 characters.')
  errs.value = e
  if (e.length) return
  Object.assign(u.value, { name: f.name.trim(), programme: f.programme, interests: i, needs: f.needs.trim(), skills: list(f.skills) })
  edit.value = false; toast('Profile saved')
}
</script>
