<template>
  <PageHeader title="My profile" desc="Your account details and a personal to-do list." />
  <div class="card"><dl class="kv"><dt>Name</dt><dd>{{ u.name }}</dd><dt>Username</dt><dd>{{ u.username || 'Not set' }}</dd><dt>Email</dt><dd>{{ u.email }}</dd><dt>Role</dt><dd>Programme coordinator</dd></dl></div>
  <AccountExtras />
  <div class="grid two">
    <section class="card" aria-labelledby="td"><h2 id="td">To-do <span class="count">{{ todos.filter(t => !t.done).length }}</span></h2>
      <p v-if="!todos.length" class="muted">Nothing on your list.</p>
      <ul class="plain"><li v-for="t in todos" :key="t.id" class="row between"><label class="inline"><input type="checkbox" :checked="t.done" @change="toggleTodo(u.id, t.id)" /> <span :class="{ done: t.done }">{{ t.text }}</span></label><button class="btn ghost sm" :aria-label="'Remove ' + t.text" @click="removeTodo(u.id, t.id)">Remove</button></li></ul>
      <div class="row" style="margin-top:8px"><input aria-label="New task" v-model="task" placeholder="Add a task" style="flex:1;min-width:160px" @keydown.enter.prevent="add" /><button class="btn sm" @click="add">Add</button></div>
      <p v-if="err" class="error" role="alert">{{ err }}</p></section>
    <section class="card" aria-labelledby="sg"><h2 id="sg">Tags</h2><p class="muted">Missing a topic when looking at career areas? Suggest a tag for the admin to approve.</p><button class="btn" @click="tag = true">Suggest a tag</button></section>
  </div>
  <SuggestTagModal v-if="tag" @close="tag = false" />
</template>
<script setup>
import { ref, computed } from 'vue'
import { me, addTodo, toggleTodo, removeTodo } from '../../composables/useStore'
import PageHeader from '../../components/PageHeader.vue'
import AccountExtras from '../../components/AccountExtras.vue'
import SuggestTagModal from '../../components/SuggestTagModal.vue'
const u = computed(me), todos = computed(() => u.value.todos || []), task = ref(''), err = ref(''), tag = ref(false)
const add = () => { err.value = addTodo(u.value.id, task.value) || ''; if (!err.value) task.value = '' }
</script>
