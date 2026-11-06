<template>
  <header class="greet"><p class="eyebrow">{{ u.title ? u.title + ' · ' + u.company : 'Profile incomplete' }}</p><h1>{{ greeting() }}, {{ u.name.split(' ')[0] }}</h1></header>
  <div class="ws">
    <div class="col-main">
      <section class="card" aria-labelledby="wf"><div class="row between"><h2 id="wf">Waiting for your reply <span class="count">{{ pending.length }}</span></h2><router-link to="/mentor/requests">All requests</router-link></div>
        <EmptyState v-if="!pending.length" icon="inbox" title="You are all caught up" text="New requests appear here and in your notifications. Thank you for making time for students." />
        <article v-for="r in pending" :key="r.id" class="reqrow">
          <Avatar :name="userById(r.studentId).name" :size="42" />
          <div><b>{{ userById(r.studentId).name }}</b> <span class="muted">· {{ userById(r.studentId).programme }}</span>
            <p class="chips"><span v-for="i in userById(r.studentId).interests" :key="i">{{ i }}</span></p>
            <p class="clip muted">{{ r.message }}</p>
            <span class="age" :class="{ late: days(r) > 7 }"><Icon name="clock" :size="13" /> Sent {{ days(r) ? days(r) + ' day' + (days(r) > 1 ? 's' : '') + ' ago' : 'today' }}<template v-if="days(r) > 7"> · the student has waited a week</template></span></div>
          <router-link class="btn" :to="`/mentor/requests/${r.id}`">Review</router-link></article></section>
      <section class="card" aria-labelledby="mn"><div class="row between"><h2 id="mn">Your mentees <span class="count">{{ mentees.length }}</span></h2><router-link to="/mentor/mentees">Open mentees</router-link></div>
        <p v-if="!mentees.length" class="muted">Accepted students appear here with their goal progress.</p>
        <ul class="plain"><li v-for="m in mentees" :key="m.id" class="person"><Avatar :name="userById(m.studentId).name" :size="38" />
          <div class="grow"><b>{{ userById(m.studentId).name }}</b><div class="bar"><i :style="{ width: gp(m.studentId) + '%' }"></i></div><span class="muted">{{ gdone(m.studentId) }} of {{ gcount(m.studentId) }} goals done · since {{ fmt(m.since) }}</span></div></li></ul></section>
    </div>
    <div class="col-side">
      <section class="card" aria-labelledby="cp"><h2 id="cp">Your capacity</h2>
        <p class="capnum"><b>{{ mentees.length }}</b> of {{ u.capacity }} places in use</p>
        <span class="slots big" aria-hidden="true"><i v-for="n in u.capacity" :key="n" :class="{ used: n <= mentees.length }"></i></span>
        <p class="muted">{{ u.paused ? 'New requests are paused.' : openSlots(u) ? openSlots(u) + ' place(s) free for new students.' : 'Full. Students cannot send you requests.' }}</p>
        <label for="cap">Maximum mentees</label><select id="cap" :value="u.capacity" @change="setCap($event.target.value)"><option v-for="n in 10" :key="n" :value="n">{{ n }}</option></select>
        <label class="inline switch"><input type="checkbox" :checked="u.paused" @change="pause" /> Pause new requests</label>
        <p class="hint">Lowering capacity never ends a current mentorship. It only blocks new requests.</p></section>
      <section class="card" aria-labelledby="vs"><h2 id="vs">Verification</h2><span class="badge" :class="u.verified ? 'accepted' : 'pending'">{{ u.verified ? 'Verified' : 'Awaiting verification' }}</span>
        <p class="muted">{{ u.verified ? 'Students can find and request you.' : 'Students cannot see your profile until an admin verifies it.' }}</p></section>
      <section class="card" aria-labelledby="us"><div class="row between"><h2 id="us">Upcoming sessions</h2><router-link to="/mentor/sessions">All</router-link></div>
        <p v-if="!upcoming.length" class="muted">No sessions booked.</p><ul class="plain"><li v-for="s in upcoming" :key="s.id"><b>{{ userById(s.studentId).name }}</b><br /><span class="muted">{{ fmtDT(s.start) }}</span></li></ul></section>
      <section class="card" aria-labelledby="av"><div class="row between"><h2 id="av">Availability</h2><router-link to="/mentor/availability">Manage</router-link></div>
        <p class="muted">{{ openSlotsN }} open slot(s) · {{ bookedN }} booked in the future.</p></section>
      <section v-if="!u.title" class="card note"><b>Complete your profile</b><p class="muted">Students cannot find you until it is filled in.</p><router-link class="btn sm" to="/mentor/profile">Complete profile</router-link></section>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { state, me, userById, activeMentees, openSlots, toast, DAY, sessionsOf, fmtDT } from '../../composables/useStore'
import { fmt, greeting } from '../../utils/helpers'
import Icon from '../../components/Icon.vue'
import Avatar from '../../components/Avatar.vue'
import EmptyState from '../../components/EmptyState.vue'
const u = computed(me), mentees = computed(() => activeMentees(u.value.id))
const pending = computed(() => state.requests.filter(r => r.mentorId === u.value.id && r.status === 'pending').sort((a, b) => a.createdAt - b.createdAt))
const upcoming = computed(() => sessionsOf(u.value.id).filter(s => s.status === 'scheduled' && s.start > Date.now()).slice(0, 3))
const fut = computed(() => state.availability.filter(a => a.mentorId === u.value.id && a.end > Date.now())), openSlotsN = computed(() => fut.value.filter(a => a.status === 'open').length), bookedN = computed(() => fut.value.filter(a => a.status === 'booked').length)
const days = r => Math.floor((Date.now() - r.createdAt) / DAY)
const gl = sid => state.goals.filter(g => g.studentId === sid), gcount = sid => gl(sid).length, gdone = sid => gl(sid).filter(g => g.status === 'done').length
const gp = sid => (gcount(sid) ? Math.round(gdone(sid) / gcount(sid) * 100) : 0)
const setCap = v => { u.value.capacity = Number(v); toast('Capacity set to ' + v) }
const pause = e => { u.value.paused = e.target.checked; toast(u.value.paused ? 'New requests paused' : 'Accepting requests again') }
</script>
