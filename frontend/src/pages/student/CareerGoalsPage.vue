<template>
  <PageHeader title="Career roadmap" desc="Dated goals turn advice into steps. Your mentor can see them but cannot change them."><button class="btn" @click="addOpen = true"><Icon name="plus" :size="16" /> Add a goal</button></PageHeader>
  <div class="rm-top">
    <section class="card rm-prog" aria-label="Progress"><Ring :pct="pct" />
      <div><h2>{{ done }} of {{ mine.length }} goals done</h2><p class="muted">{{ by('doing').length }} in progress · {{ by('todo').length }} still to start{{ overdue ? ' · ' + overdue + ' overdue' : '' }}</p></div></section>
    <section class="card nextms" aria-label="Next milestone"><p class="eyebrow">Next milestone</p>
      <template v-if="nextGoal"><h2>{{ nextGoal.title }}</h2><p class="muted"><Icon name="calendar" :size="14" /> Due {{ fmt(nextGoal.target) }}<template v-if="late(nextGoal)"> · overdue</template></p>
        <button class="btn sm" @click="mv(nextGoal, 1)">{{ nextGoal.status === 'doing' ? 'Mark done' : 'Start this goal' }}</button></template>
      <p v-else class="muted">{{ mine.length ? 'Every goal is done. Add a new one to keep going.' : 'Add a goal to see your next milestone here.' }}</p></section>
  </div>
  <EmptyState v-if="!mine.length" icon="target" title="Your roadmap is empty" text="Start with one goal you could reach in a month, such as finishing a course or updating your resume."><button class="btn sm" @click="addOpen = true">Add a goal</button></EmptyState>
  <div class="board">
    <section v-for="c in cols" :key="c[0]" class="col" :class="'col-' + c[0]" :aria-label="c[1]"><h2>{{ c[1] }} <span class="count">{{ by(c[0]).length }}</span></h2>
      <p v-if="!by(c[0]).length" class="muted">Nothing here.</p>
      <article v-for="g in by(c[0])" :key="g.id" class="goal"><b>{{ g.title }}</b><p v-if="g.description" class="muted">{{ g.description }}</p>
        <span class="due" :class="{ late: late(g) }"><Icon name="calendar" :size="14" /> {{ fmt(g.target) }}<template v-if="late(g)"> · overdue</template></span>
        <p v-if="g.tags && g.tags.length" class="chips"><span v-for="t in g.tags" :key="t">{{ t }}</span></p>
        <span class="due"><Icon :name="g.visibility === 'me' ? 'eyeoff' : 'eye'" :size="14" /> {{ (VIS.find(v => v[0] === g.visibility) || [0, ''])[1] }}<template v-if="g.visibility !== 'me'"> · coordinators can see it</template></span>
        <div class="row"><button v-if="c[0] !== 'todo'" class="btn ghost sm" @click="mv(g, -1)">Move back</button>
          <button v-if="c[0] !== 'done'" class="btn ghost sm" @click="mv(g, 1)">{{ c[0] === 'doing' ? 'Mark done' : 'Start' }}</button>
          <button class="btn ghost sm" @click="openEdit(g)" :aria-label="'Edit ' + g.title"><Icon name="edit" :size="14" /></button>
          <button class="btn ghost sm" @click="ask = g" :aria-label="'Delete ' + g.title"><Icon name="trash" :size="14" /></button></div></article></section>
  </div>
  <ConfirmModal v-if="addOpen" title="Add a goal" ok="Add goal" @ok="add" @cancel="addOpen = false">
    <label for="t">Goal</label><input id="t" v-model="title" placeholder="e.g. Finish SQL practice" /><label for="d">Target date</label><input id="d" type="date" v-model="target" />
    <label for="ds">Notes (optional)</label><input id="ds" v-model="desc" placeholder="What does done look like?" />
    <label for="gt">Tags (comma separated)</label><input id="gt" v-model="tagsIn" placeholder="e.g. SQL, Portfolio" />
    <label for="gv">Who can see this goal?</label><select id="gv" v-model="vis"><option v-for="v in VIS" :key="v[0]" :value="v[0]">{{ v[1] }}</option></select>
    <p class="hint">Programme coordinators can see every goal that is not private.</p><p v-if="err" class="error" role="alert">{{ err }}</p></ConfirmModal>
  <ConfirmModal v-if="ask" title="Delete this goal?" ok="Delete" danger @ok="del" @cancel="ask = null"><p>{{ ask.title }}</p></ConfirmModal>
  <ConfirmModal v-if="ed" title="Edit goal" ok="Save changes" @ok="saveEdit" @cancel="ed = null">
    <label for="et">Title</label><input id="et" v-model="draft.title" /><label for="ed">Target date</label><input id="ed" type="date" v-model="draft.target" />
    <label for="en">Notes</label><input id="en" v-model="draft.description" />
    <label for="et2">Tags (comma separated)</label><input id="et2" v-model="draft.tags" />
    <label for="ev">Who can see this goal?</label><select id="ev" v-model="draft.visibility"><option v-for="v in VIS" :key="v[0]" :value="v[0]">{{ v[1] }}</option></select>
    <p class="hint">Programme coordinators can see every goal that is not private.</p><p v-if="eerr" class="error" role="alert">{{ eerr }}</p></ConfirmModal>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { state, me, addGoal, toast, VIS } from '../../composables/useStore'
import { fmt, list } from '../../utils/helpers'
import PageHeader from '../../components/PageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import Icon from '../../components/Icon.vue'
import Ring from '../../components/Ring.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
const cols = [['todo', 'To do'], ['doing', 'In progress'], ['done', 'Done']], order = ['todo', 'doing', 'done']
const tagsIn = ref(''), vis = ref('me'), title = ref(''), target = ref(''), desc = ref(''), err = ref(''), addOpen = ref(false), ask = ref(null), ed = ref(null), eerr = ref(''), draft = reactive({})
const mine = computed(() => state.goals.filter(g => g.studentId === me().id))
const by = s => mine.value.filter(g => g.status === s)
const done = computed(() => by('done').length)
const pct = computed(() => (mine.value.length ? Math.round(done.value / mine.value.length * 100) : 0))
const late = g => g.status !== 'done' && new Date(g.target) < new Date(new Date().toDateString())
const overdue = computed(() => mine.value.filter(late).length)
const nextGoal = computed(() => mine.value.filter(g => g.status !== 'done').sort((a, b) => a.target.localeCompare(b.target))[0])
function add() { err.value = addGoal(me().id, title.value, target.value, desc.value, vis.value, list(tagsIn.value)) || ''; if (!err.value) { title.value = target.value = desc.value = tagsIn.value = ''; vis.value = 'me'; addOpen.value = false; toast('Goal added') } }
const mv = (g, dir) => { g.status = order[order.indexOf(g.status) + dir]; toast('Goal moved to ' + cols.find(c => c[0] === g.status)[1]) }
const openEdit = g => { ed.value = g; eerr.value = ''; Object.assign(draft, { title: g.title, target: g.target, description: g.description || '', tags: (g.tags || []).join(', '), visibility: g.visibility || 'me' }) }
function saveEdit() {
  if (draft.title.trim().length < 3) return (eerr.value = 'Give the goal a title of at least 3 characters.')
  if (!draft.target) return (eerr.value = 'Choose a target date.')
  if (draft.target !== ed.value.target && new Date(draft.target) < new Date(new Date().toDateString())) return (eerr.value = 'A new target date cannot be in the past.')
  Object.assign(ed.value, { title: draft.title.trim(), target: draft.target, description: draft.description.trim(), tags: list(draft.tags), visibility: draft.visibility }); ed.value = null; toast('Goal updated')
}
function del() { state.goals.splice(state.goals.indexOf(ask.value), 1); ask.value = null; toast('Goal deleted') }
</script>
