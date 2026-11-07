<template>
  <div class="grid two">
    <section class="card" aria-labelledby="tg"><h2 id="tg">Tags</h2>
      <h3 class="sub">Suggested <span class="count">{{ sug.length }}</span></h3><p v-if="!sug.length" class="muted">No suggestions waiting.</p>
      <ul class="plain"><li v-for="t in sug" :key="t.id" class="row between"><b>{{ t.name }}</b><span class="row"><button class="btn sm" @click="t.status = 'approved'; toast('Tag approved')">Approve</button><button class="btn ghost sm" @click="rej(t)">Reject</button></span></li></ul>
      <h3 class="sub">Approved ({{ app.length }})</h3><p class="chips"><span v-for="t in app" :key="t.id">{{ t.name }}</span></p>
      <h3 class="sub">Merge duplicates</h3><div class="two-col"><div><label for="mf">Merge this tag</label><select id="mf" v-model="mf"><option value="">Select</option><option v-for="t in state.tags" :key="t.id" :value="t.id">{{ t.name }}</option></select></div>
        <div><label for="mt">Into</label><select id="mt" v-model="mt"><option value="">Select</option><option v-for="t in app" :key="t.id" :value="t.id">{{ t.name }}</option></select></div></div>
      <p v-if="merr" class="error" role="alert">{{ merr }}</p><button class="btn ghost" :disabled="!mf || !mt" @click="merge">Merge tags</button></section>
    <section class="card" aria-labelledby="nt"><h2 id="nt">Add a new tag</h2><p class="muted">Tags added here are approved straight away and appear for everyone.</p>
      <label for="ntn">Tag name</label><input id="ntn" v-model="nt" maxlength="40" @keydown.enter.prevent="newTag" /><p v-if="terr" class="error" role="alert">{{ terr }}</p><button class="btn" @click="newTag">Add tag</button>
      <p class="hint">Feedback ratings use a fixed set of criteria (Communication, Helpfulness, Preparedness), so they are not editable here.</p></section>
  </div>
  <section class="card" aria-labelledby="ag"><h2 id="ag">All goals <span class="count">{{ state.goals.length }}</span></h2><div class="scroll"><table><thead><tr><th>Student</th><th>Goal</th><th>Status</th><th>Visibility</th><th>Due</th></tr></thead><tbody>
    <tr v-for="g in state.goals" :key="g.id"><td>{{ userById(g.studentId).name }}</td><td>{{ g.title }}</td><td>{{ lbl[g.status] }}</td><td>{{ visLabel(g.visibility) }}</td><td>{{ fmt(g.target) }}</td></tr></tbody></table></div></section>
  <section class="card" aria-labelledby="af"><h2 id="af">All feedback <span class="count">{{ state.feedback.length }}</span></h2><p v-if="!state.feedback.length" class="muted">No feedback yet.</p>
    <ul class="plain"><li v-for="f in state.feedback" :key="f.id"><b>{{ userById(f.fromId).name }} about {{ userById(f.toId).name }}</b> · {{ f.kind === 'final' ? 'final' : 'session' }} · {{ avgScore(f) }} / 5 · {{ f.isPublic ? 'public' : 'private' }}<br /><span class="muted">{{ f.comments || 'No comments' }}</span></li></ul>
    <h3 class="sub">Anonymous platform feedback</h3><ul class="plain"><li v-for="p in state.platformFeedback" :key="p.id">{{ p.text }} <span class="muted">· {{ fmt(p.at) }}</span></li></ul></section>
</template>
<script setup>
import { ref, computed } from 'vue'
import { state, userById, mergeTags, addTag, avgScore, VIS, toast } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
const sug = computed(() => state.tags.filter(t => t.status === 'suggested')), app = computed(() => state.tags.filter(t => t.status === 'approved'))
const mf = ref(''), mt = ref(''), merr = ref(''), nt = ref(''), terr = ref(''), lbl = { todo: 'To do', doing: 'In progress', done: 'Done' }
const visLabel = v => (VIS.find(x => x[0] === v) || [0, v])[1]
const rej = t => { state.tags.splice(state.tags.indexOf(t), 1); toast('Suggestion rejected') }
const merge = () => { merr.value = mergeTags(mf.value, mt.value) || ''; if (!merr.value) { toast('Tags merged'); mf.value = mt.value = '' } }
const newTag = () => { terr.value = addTag(nt.value) || ''; if (!terr.value) { toast('Tag added'); nt.value = '' } }
</script>
