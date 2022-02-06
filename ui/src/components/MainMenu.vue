<template>
    <q-toolbar class="text-white bg-primary" style="height: 50px">
        <q-btn flat class="noactive" @click="routerGoto('/')">home</q-btn>
        <q-separator class="noactive" color="white" vertical style="margin: 10px"></q-separator>
        <q-btn flat :class="{ noactive: router.currentRoute.value.path !== '/realtime'}" @click="routerGoto('/realtime')">realtime</q-btn>
        <q-btn flat :class="{ noactive: router.currentRoute.value.path !== '/historyservice' }" @click="routerGoto('/historyservice')">service log</q-btn>
        <q-btn flat :class="{ noactive: router.currentRoute.value.path !== '/historytask' }" @click="routerGoto('/historytask')">tasks history</q-btn>
        <q-btn flat :class="{ noactive: router.currentRoute.value.path !== '/depot' }" @click="routerGoto('/depot')">edit tasks</q-btn>
        <q-space />
        <q-separator v-show="token && token.length > 0" class="noactive" color="white" vertical style="margin: 10px"></q-separator>
        <q-btn v-show="token && token.length > 0" flat class="noactive"  @click="signout()">sign out</q-btn>
    </q-toolbar>
</template>
<script lang="ts">
import { defineComponent} from "vue"
import * as env from "@/core/_env"
import * as security from "@/core/security"
import * as route from "@/core/router"

export default defineComponent({
    setup() {
        const signout = () => {
            security.setToken("")
        }

        return {
            routerGoto: env.routerGoto,
            signout,
            token: security.token,
            router: route.router
        }
    }
})
</script>
<style lang="sass" scoped>
.noactive
    opacity: 0.7
</style>
