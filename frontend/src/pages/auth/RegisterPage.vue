<template>
  <AuthLayout>
    <h1 class="auth-h">Create your account</h1>
    <div class="seg two" role="group" aria-label="Join as">
      <button type="button" :class="{ on: f.role === 'student' }" :aria-pressed="f.role === 'student'" @click="f.role = 'student'"><Icon name="graduation" :size="16" /> I am a student</button>
      <button type="button" :class="{ on: f.role === 'mentor' }" :aria-pressed="f.role === 'mentor'" @click="f.role = 'mentor'"><Icon name="heart" :size="16" /> I am an alumnus</button></div>
    <p class="rolecopy">{{ f.role === 'student' ? 'The more mentors know about you, the easier it is for them to say yes. Your email stays hidden until a request is accepted.' : 'Your profile is checked by an administrator before students can see it. You choose how many students you mentor and can pause requests at any time.' }}</p>
    <form @submit.prevent="submit" novalidate>
      <fieldset><legend>Account</legend>
        <div class="two-col"><div><label for="n">Full name</label><input id="n" v-model="f.name" autocomplete="name" /></div>
          <div><label for="un">Username</label><input id="un" v-model="f.username" autocomplete="username" autocapitalize="off" placeholder="e.g. aarav_s" /></div></div>
        <label for="ph">Phone (optional)</label><input id="ph" v-model="f.phone" inputmode="tel" autocomplete="tel" placeholder="10-digit mobile number" />
        <label for="e">Email</label><input id="e" v-model="f.email" type="email" autocomplete="email" />
        <p class="hint">{{ f.role === 'student' ? 'Use your IITM email, ending in study.iitm.ac.in.' : 'Use the email where you would like to be contacted.' }}</p>
        <div class="two-col"><PasswordField id="p" v-model="f.password" label="Password" autocomplete="new-password" /><PasswordField id="c" v-model="f.confirm" label="Confirm password" autocomplete="new-password" /></div>
        <p class="hint">At least 8 characters, with letters and numbers.</p></fieldset>

      <fieldset v-if="f.role === 'student'"><legend>About your studies</legend>
        <div class="two-col"><div><label for="rn">IITM roll number</label><input id="rn" v-model="f.rollNo" placeholder="e.g. 24f1002112" autocapitalize="off" /></div>
          <div><label for="pl">Programme level</label><select id="pl" v-model="f.programme"><option value="">Select</option><option v-for="p in progs" :key="p">{{ p }}</option></select></div></div>
        <label for="dg">Degree</label><select id="dg" v-model="f.degree"><option value="">Select</option><option v-for="d in DEGREES" :key="d">{{ d }}</option></select>
        <label for="em">What are you doing right now?</label><select id="em" v-model="f.employment"><option value="">Select</option><option v-for="x in jobs" :key="x">{{ x }}</option></select>
</fieldset>

      <fieldset v-else><legend>About you as a mentor</legend>
        <div class="two-col"><div><label for="jt">Job title</label><input id="jt" v-model="f.title" /></div><div><label for="co">Company or institution</label><input id="co" v-model="f.company" /></div></div>
        <div class="two-col"><div><label for="ca">Career area</label><select id="ca" v-model="f.careerArea"><option value="">Select</option><option v-for="a in CAREER_AREAS" :key="a">{{ a }}</option></select></div><div><label for="ind0">Industry</label><input id="ind0" v-model="f.industry" placeholder="e.g. Fintech" /></div></div>
        <div class="two-col"><div><label for="yx">Years of experience</label><input id="yx" type="number" min="0" max="50" v-model.number="f.years" /></div></div>
        <div class="two-col"><div><label for="cp">IITM programme completed</label><select id="cp" v-model="f.completed"><option value="">Select</option><option v-for="p in progs" :key="p">{{ p }}</option></select></div>
          <div><label for="gy">Year completed</label><input id="gy" type="number" :min="2015" :max="thisYear" v-model.number="f.gradYear" /></div></div>
        <label for="bio">Short biography</label><textarea id="bio" v-model="f.bio" rows="3"></textarea><p class="hint">{{ f.bio.trim().length }} characters (minimum 30)</p>
        <label>Expertise (choose 1 to 6) · {{ f.expertise.length }} selected</label>
        <div class="chipset"><button v-for="t in tags" :key="t" type="button" class="chipbtn" :class="{ on: f.expertise.includes(t) }" :aria-pressed="f.expertise.includes(t)" @click="pick(f.expertise, t, 6)">{{ t }}</button></div>
        <button type="button" class="btn ghost sm" style="margin-top:8px" @click="sugg = true">Suggest a tag</button>
        <label>Support you can offer (choose at least 1)</label>
        <div class="chipset"><button v-for="t in supports" :key="t" type="button" class="chipbtn" :class="{ on: f.support.includes(t) }" :aria-pressed="f.support.includes(t)" @click="pick(f.support, t, 6)">{{ t }}</button></div>
        <div class="two-col"><div><label for="cap">How many students can you mentor? (1 to 10)</label><input id="cap" type="number" min="1" max="10" v-model.number="f.capacity" /></div>
          <div><label for="li">LinkedIn profile (optional)</label><input id="li" v-model="f.linkedin" type="url" placeholder="https://www.linkedin.com/in/…" /></div></div></fieldset>

      <label class="inline consent"><input type="checkbox" v-model="f.agree" /> I agree to share my profile with signed-in members of the programme and to follow the mentoring guidelines.</label>
      <ul v-if="errs.length" class="errlist" role="alert"><li v-for="e in errs" :key="e">{{ e }}</li></ul>
      <button class="btn block lg">Create account</button>
    </form>
    <SuggestTagModal v-if="sugg" @close="sugg = false" />
    <p class="muted center">Already registered? <router-link to="/login">Sign in</router-link></p>
  </AuthLayout>
</template>
<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '../../layouts/AuthLayout.vue'
import Icon from '../../components/Icon.vue'
import PasswordField from '../../components/PasswordField.vue'
import { register, approvedTags } from '../../composables/useStore'
import { emailOk, iitmOk, passOk, DEGREES, CAREER_AREAS } from '../../utils/helpers'
import SuggestTagModal from '../../components/SuggestTagModal.vue'
const router = useRouter(), thisYear = new Date().getFullYear(), tags = computed(approvedTags), errs = ref([]), sugg = ref(false)
const progs = ['Foundation', 'Diploma', 'BSc', 'BS Degree'], jobs = ['Studying only', 'Working full time', 'Working part time', 'Between jobs'], supports = ['Resume review', 'Mock interviews', 'Career advice', 'Project guidance', 'Application review']
const f = reactive({ role: 'student', name: '', username: '', degree: '', careerArea: '', phone: '', email: '', password: '', confirm: '', rollNo: '', programme: '', employment: '',
  title: '', company: '', years: 0, industry: '', completed: '', gradYear: thisYear - 1, bio: '', expertise: [], support: [], capacity: 2, linkedin: '', agree: false })
const pick = (arr, t, max) => { const i = arr.indexOf(t); if (i >= 0) arr.splice(i, 1); else if (arr.length < max) arr.push(t) }
function submit() {
  const e = [], s = f.role === 'student'
  if (f.name.trim().length < 2) e.push('Enter your full name.')
  if (!/^[a-z0-9_]{3,20}$/.test(f.username.trim().toLowerCase())) e.push('Choose a username of 3 to 20 letters, numbers or underscores.')
  if (f.phone.trim() && !/^\+?\d[\d\s-]{8,13}$/.test(f.phone.trim())) e.push('Enter a valid phone number, or leave it empty.')
  if (!emailOk(f.email)) e.push('Enter a valid email address.')
  else if (s && !iitmOk(f.email)) e.push('Student emails must end with study.iitm.ac.in.')
  if (!passOk(f.password)) e.push('Password needs at least 8 characters, with letters and numbers.')
  if (f.password !== f.confirm) e.push('Passwords do not match.')
  if (s) {
    if (!/^\d{2}[fF]\d{7}$/.test(f.rollNo.trim())) e.push('Enter your IITM roll number, for example 24f1002112.')
    if (!f.programme) e.push('Select your programme level.')
    if (!f.degree) e.push('Select your degree (ES, DS, Aero or Management).')
    if (!f.employment) e.push('Tell us what you are doing right now.')
  } else {
    if (f.title.trim().length < 2) e.push('Enter your job title.')
    if (f.company.trim().length < 2) e.push('Enter your company or institution.')
    if (!(f.years >= 0 && f.years <= 50)) e.push('Years of experience must be between 0 and 50.')
    if (!f.careerArea) e.push('Select your career area.')
    if (!f.industry.trim()) e.push('Enter your industry.')
    if (!f.completed) e.push('Select the IITM programme you completed.')
    if (!(f.gradYear >= 2015 && f.gradYear <= thisYear)) e.push(`Enter the year you completed, between 2015 and ${thisYear}.`)
    if (f.bio.trim().length < 30) e.push('Write a biography of at least 30 characters.')
    if (f.expertise.length < 1) e.push('Choose at least 1 area of expertise.')
    if (f.support.length < 1) e.push('Choose at least 1 type of support you can offer.')
    if (!(f.capacity >= 1 && f.capacity <= 10)) e.push('Capacity must be between 1 and 10.')
    if (f.linkedin.trim() && !/^https:\/\/([\w-]+\.)?linkedin\.com\/.+/i.test(f.linkedin.trim())) e.push('LinkedIn link must start with https://linkedin.com/ or https://www.linkedin.com/.')
  }
  if (!f.agree) e.push('Please accept the sharing and guidelines statement.')
  if (!e.length) {
    const extra = s ? { username: f.username, degree: f.degree, rollNo: f.rollNo.trim().toLowerCase(), programme: f.programme, employment: f.employment, phone: f.phone.trim() }
      : { username: f.username, careerArea: f.careerArea, title: f.title.trim(), company: f.company.trim(), years: f.years, industry: f.industry.trim(), completed: f.completed, gradYear: f.gradYear, bio: f.bio.trim(), expertise: [...f.expertise], support: [...f.support], capacity: f.capacity, linkedin: f.linkedin.trim(), phone: f.phone.trim() }
    const r = register({ name: f.name, email: f.email, password: f.password, role: f.role, extra }); if (r) e.push(r)
  }
  errs.value = e
  if (!e.length) router.push('/register/success')
}
</script>
