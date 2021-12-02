<template>
    <q-toolbar class="text-primary">
        <q-btn flat @click="goto('welcome')">home</q-btn>
        <q-btn flat @click="goto('dashboard')">dashboard</q-btn>
        <q-btn flat @click="goto('history')">history</q-btn>
        <q-btn flat @click="goto('edit')">edit</q-btn>
        <q-space />
        <q-btn flat>sign in</q-btn>
    </q-toolbar>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import { console, goto } from "@/router"

export default defineComponent({
    setup() {
        return {
            console: console.value,
            goto: goto
        }
    }
})
</script>
