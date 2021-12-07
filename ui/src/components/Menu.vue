<template>
    <q-toolbar class="text-white bg-primary" v-show="$route.path === '/workflow'">
        <q-btn flat @click="routerGoto('u-welcome')">home</q-btn>
        <q-btn flat @click="routerGoto('w-dashboard')">dashboard</q-btn>
        <q-btn flat @click="routerGoto('w-history')">history</q-btn>
        <q-btn flat @click="routerGoto('w-edit')">edit</q-btn>
        <q-space />
        <q-btn flat v-show="stateToken.token" @click="clearToken()">sign out</q-btn>
    </q-toolbar>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import { routerGoto } from "@/transport/router"
import { clearToken, stateToken } from "@/store/token"

export default defineComponent({
    setup() {
        return {
            routerGoto,
            stateToken,
            clearToken
        }
    }
})
</script>
