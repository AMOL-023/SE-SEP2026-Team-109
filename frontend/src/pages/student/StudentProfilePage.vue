<template>
  <div class="row between"><h1>My profile</h1><button v-if="!edit" class="btn" @click="start">Edit profile</button></div>
  <div class="card"><div class="bar"><i :style="{ width: pct + '%' }"></i></div><p class="muted">Profile {{ pct }}% complete. Mentors see this before they respond.</p>
    <form v-if="edit" @submit.prevent="save" novalidate>
      <label for="n">Full name</label><input id="n" v-model="f.name" />
      <label>Email</label><input :value="u.email" disabled />
      <label for="p">Programme level</label><select id="p" v-model="f.programme"><option value="">Select</option><option v-for="p in progs" :key="p">{{ p }}</option></select>
      <label for="i">Career interests (1 to 5, comma separated)</label><input id="i" v-model="f.interests" />
      <label for="nd">What do you need help with?</label><textarea id="nd" v-model="f.needs" rows="4"></textarea>
      <fieldset><legend>Skills and levels</legend>
        <div v-for="(k, i) in f.skills" :key="i" class="skillrow"><input :aria-label="'Skill name ' + (i + 1)" v-model="k.name" /><select :aria-label="'Level for ' + k.name" v-model.number="k.level"><option v-for="n in 5" :key="n" :value="n">Level {{ n }}</option></select>
          <label class="inline"><input type="checkbox" v-model="k.want" /> Want to learn</label><button type="button" class="btn ghost sm" @click="f.skills.splice(i, 1)" :aria-label="'Remove ' + k.name">Remove</button></div>
        <div class="row"><input aria-label="New skill" v-model="newSkill" placeholder="Add a skill, e.g. SQL" style="flex:1;min-width:160px" @keydown.enter.prevent="addSkill" /><button type="button" class="btn ghost sm" @click="addSkill">Add skill</button></div></fieldset>
      <p v-for="e in errs" :key="e" class="error" role="alert">{{ e }}</p>
      <div class="row"><button class="btn">Save changes</button><button type="button" class="btn ghost" @click="edit = false">Cancel</button></div>
    </form>
    <dl v-else class="kv"><dt>Name</dt><dd>{{ u.name }}</dd><dt>Email</dt><dd>{{ u.email }}</dd><dt>Roll number</dt><dd>{{ u.rollNo || 'Not set' }}</dd><dt>Programme</dt><dd>{{ u.programme || 'Not set' }}</dd><dt>Currently</dt><dd>{{ u.employment || 'Not set' }}</dd>
      <dt>Interests</dt><dd>{{ u.interests.join(', ') || 'Not set' }}</dd><dt>Needs</dt><dd>{{ u.needs || 'Not set' }}</dd><dt>Skills</dt><dd><span v-if="!u.skills.length">Not set</span><span v-for="k in u.skills" :key="k.name" class="chips"><span>{{ k.name }} · level {{ k.level }}{{ k.want ? ' · want to learn' : '' }}</span></span></dd></dl>
  </div>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { me, toast } from '../../composables/useStore'
import { list } from '../../utils/helpers'
const u = computed(me), edit = ref(false), errs = ref([]), f = reactive({}), newSkill = ref(''), progs = ['Foundation', 'Diploma', 'BSc', 'BS Degree']
const pct = computed(() => Math.round([u.value.programme, u.value.interests.length, u.value.needs, u.value.skills.length].filter(Boolean).length * 25))
const addSkill = () => { const n = newSkill.value.trim(); if (n) { f.skills.push({ name: n, level: 1, want: false }); newSkill.value = '' } }
const start = () => { Object.assign(f, { name: u.value.name, programme: u.value.programme, interests: u.value.interests.join(', '), needs: u.value.needs, skills: u.value.skills.map(x => ({ ...x })) }); errs.value = []; edit.value = true }
function save() {
  const e = [], i = list(f.interests)
  if (f.name.trim().length < 2) e.push('Enter your name.')
  if (!f.programme) e.push('Select your programme level.')
  if (i.length < 1 || i.length > 5) e.push('Add between 1 and 5 career interests.')
  if (f.needs.trim().length < 20) e.push('Describe your mentoring needs in at least 20 characters.')
  const sk = f.skills.filter(k => k.name.trim()), names = sk.map(k => k.name.trim().toLowerCase())
  if (sk.some(k => !(k.level >= 1 && k.level <= 5))) e.push('Skill levels must be between 1 and 5.')
  if (new Set(names).size !== names.length) e.push('Each skill can be listed only once.')
  errs.value = e
  if (e.length) return
  Object.assign(u.value, { name: f.name.trim(), programme: f.programme, interests: i, needs: f.needs.trim(), skills: sk.map(k => ({ name: k.name.trim(), level: k.level, want: !!k.want })) })
  edit.value = false; toast('Profile saved')
}
</script>
