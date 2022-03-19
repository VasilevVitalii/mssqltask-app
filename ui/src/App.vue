<template>
    <MainMenu v-show="router.currentRoute.value.path !== '/' && state.data.showMainMenu" ></MainMenu>
    <router-view />
</template>
<script lang="ts">
import MainMenu from "@/components/MainMenu.vue"
import { useQuasar } from "quasar"
import { onNotify } from "@/core/dialog"
import * as route from "@/core/router"
import { state, callbacksFullScreen } from './state'

export default {
    components: {
        MainMenu
    },
    setup() {
        const $q = useQuasar()
        onNotify(notify => {
            $q.notify(notify)
        })

        window.onresize = function () {
            if (window.matchMedia('(display-mode: fullscreen)').matches || window.document.fullscreenElement) {
                state.data.fullscreen = true
                callbacksFullScreen.forEach(callback => {
                    callback()
                })
            } else {
                state.data.fullscreen = false
                callbacksFullScreen.forEach(callback => {
                    callback()
                })
            }
        }

        state.func.onFullScreen(() => {
            state.data.showMainMenu = !state.data.fullscreen
        })

        return {
            router: route.router,
            state
        }
    }
}
</script>
<style lang="sass">
.bg-negative-light
    background-color: #C1001510
.bg-positive-light
    background-color: #21BA4510
</style>