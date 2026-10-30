<template>
  <h1>Career goals</h1>
  <form class="card goalform" @submit.prevent="add" novalidate>
    <div><label for="t">New goal</label><input id="t" v-model="title" /></div>
    <div><label for="d">Target date</label><input id="d" type="date" v-model="target" /></div>
    <button class="btn">Add goal</button>
    <p v-if="err" class="error" role="alert">{{ err }}</p>
  </form>
  <div class="grid three">
    <section v-for="c in cols" :key="c[0]" class="card"><h2>{{ c[1] }} ({{ by(c[0]).length }})</h2>
      <p v-if="!by(c[0]).length" class="muted">Nothing here.</p>
      <article v-for="g in by(c[0])" :key="g.id" class="goal"><b>{{ g.title }}</b><span class="muted">Target {{ fmt(g.target) }}</span>
        <div class="row"><button v-if="c[0] !== 'todo'" class="btn ghost sm" @click="mv(g, -1)">Move back</button>
          <button v-if="c[0] !== 'done'" class="btn ghost sm" @click="mv(g, 1)">{{ c[0] === 'doing' ? 'Mark done' : 'Start' }}</button>
          <button class="btn ghost sm" @click="ask = g">Delete</button></div></article></section>
  </div>
  <ConfirmModal v-if="ask" title="Delete this goal?" ok="Delete" danger @ok="del" @cancel="ask = null"><p>{{ ask.title }}</p></ConfirmModal>
</template>
<script setup>
import { ref, computed } from 'vue'
import { state, me, addGoal, toast } from '../../composables/useStore'
import { fmt } from '../../utils/helpers'
import ConfirmModal from '../../components/ConfirmModal.vue'
const cols = [['todo', 'To do'], ['doing', 'In progress'], ['done', 'Done']], order = ['todo', 'doing', 'done']
const title = ref(''), target = ref(''), err = ref(''), ask = ref(null)
const mine = computed(() => state.goals.filter(g => g.studentId === me().id))
const by = s => mine.value.filter(g => g.status === s)
function add() { err.value = addGoal(me().id, title.value, target.value) || ''; if (!err.value) { title.value = target.value = ''; toast('Goal added') } }
const mv = (g, dir) => { g.status = order[order.indexOf(g.status) + dir]; toast('Goal updated') }
function del() { state.goals.splice(state.goals.indexOf(ask.value), 1); ask.value = null; toast('Goal deleted') }
</script>
