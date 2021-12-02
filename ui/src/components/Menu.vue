<template>
    <q-toolbar class="text-white bg-primary" v-show="$route.path === '/workflow'">
        <q-btn flat @click="goto('u-welcome')">home</q-btn>
        <q-btn flat @click="goto('w-dashboard')">dashboard</q-btn>
        <q-btn flat @click="goto('w-history')">history</q-btn>
        <q-btn flat @click="goto('w-edit')">edit</q-btn>
        <q-space />
        <q-btn flat>sign in</q-btn>
    </q-toolbar>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import { workflow, goto } from "@/router"

export default defineComponent({
    setup() {
        return {
            workflow: workflow.value,
            goto: goto
        }
    }
})
</script>
