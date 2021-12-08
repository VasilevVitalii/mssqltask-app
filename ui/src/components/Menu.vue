<template>
    <q-toolbar class="text-white bg-primary" v-show="$route.path === '/workflow'">
        <q-btn flat class="noactive" @click="routerGoto('u-welcome')">home</q-btn>
        <q-btn flat :class="{ noactive: stateRouter.currentWorkflow !== 'w-dashboard' }" @click="routerGoto('w-dashboard')">dashboard</q-btn>
        <q-btn flat :class="{ noactive: stateRouter.currentWorkflow !== 'w-history' }" @click="routerGoto('w-history')">history</q-btn>
        <q-btn flat :class="{ noactive: stateRouter.currentWorkflow !== 'w-edit' }" @click="routerGoto('w-edit')">edit</q-btn>
        <q-space />
        <q-btn flat class="noactive" v-show="stateToken.token && stateToken.token.length > 0" @click="setToken('')">sign out</q-btn>
    </q-toolbar>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import { routerGoto, stateRouter } from "@/transport/router"
import { setToken, stateToken } from "@/store/token"

export default defineComponent({
    setup() {
        return {
            routerGoto,
            stateToken,
            setToken,
            stateRouter
        }
    }
})
</script>
<style lang="sass" scoped>
.noactive
    opacity: 0.8
</style>
