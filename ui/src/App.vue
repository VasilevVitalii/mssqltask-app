<template>
    <MainMenu v-show="router.currentRoute.value.path !== '/' && state.data.showMainMenu" ></MainMenu>
    <router-view />
</template>
<script lang="ts">
import MainMenu from "@/components/MainMenu.vue"
import { useQuasar } from "quasar"
import { onNotify } from "@/core/dialog"
import * as route from "@/core/router"
import { state } from './state'
// import { onGoto } from "@/core/router"
// import { onSetToken } from "@/core/token"
// import { state as stateEdit } from "@/state/edit"
// import { state as stateTaskLog } from "@/state/taskLog"
// import { state as stateServiceLog } from "@/state/serviceLog"

export default {
    components: {
        MainMenu
    },
    setup() {
        const $q = useQuasar()
        onNotify(notify => {
            $q.notify(notify)
        })

        return {
            router: route.router,
            state
        }

        // onGoto((from, to, workflow) => {
        //     if (to?.url === "u-workflow") {
        //         if (workflow === "w-edit" && !stateEdit.loadedInit) {
        //             stateEdit.load()
        //         }
        //     }
        // })

        // onSetToken((prev, curr) => {
        //     if (prev !== curr) {
        //         stateEdit.loadedInit = false
        //         stateTaskLog.loadedInit = false
        //         stateServiceLog.loadedInit = false
        //     }
        // })
    }
}
</script>
<style lang="sass">
.bg-negative-light
    background-color: #C1001510
.bg-positive-light
    background-color: #21BA4510
</style>