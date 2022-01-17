<template>
    <q-toolbar class="text-white bg-primary" v-show="$route.path === '/workflow'" style="height: 50px">
        <q-btn flat class="noactive" @click="routerGoto('u-welcome')">home</q-btn>
        <q-separator class="noactive" color="white" vertical style="margin: 10px"></q-separator>
        <q-btn flat :class="{ noactive: stateRouter.currentWorkflow !== 'w-dashboard' }" @click="routerGoto('w-dashboard')">dashboard</q-btn>
        <q-btn flat :class="{ noactive: stateRouter.currentWorkflow !== 'w-history' }" @click="routerGoto('w-history')">history</q-btn>
        <q-btn flat :class="{ noactive: stateRouter.currentWorkflow !== 'w-edit' }" @click="routerGoto('w-edit')">edit</q-btn>
        <q-space />
        <div v-show="stateToken.token && stateToken.token.length > 0">
            <q-separator class="noactive" color="white" vertical style="margin: 10px"></q-separator>
            <q-btn flat class="noactive"  @click="signout()">sign out</q-btn>
        </div>
    </q-toolbar>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import { goto as routerGoto, state as stateRouter } from "@/core/router"
import { cancel, state as stateToken } from "@/core/token"
import { state as stateTaskLog } from "@/state/taskLog"

export default defineComponent({
    setup() {
        const signout = () => {
            cancel()
        }

        return {
            routerGoto,
            stateToken,
            signout,
            stateRouter
        }
    }
})
</script>
<style lang="sass" scoped>
.noactive
    opacity: 0.8
</style>
