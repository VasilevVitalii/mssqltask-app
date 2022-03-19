<template>
    <ComponentMenuUp v-show="showMenuUp"/>
    <ComponentServers v-if="state.func.showDetailsByTask()"/>
    <ComponentTasks v-else/>
</template>
<script lang="ts">
import { ref } from 'vue'
import { state } from './state'
import { state as stateMain } from '@/state'
import * as env from '@/core/_env'
import ComponentTasks from './tasks.vue'
import ComponentServers from './servers.vue'
import ComponentMenuUp from './menuUp.vue'

export default {
    components: {
        ComponentTasks,
        ComponentMenuUp,
        ComponentServers
    },
    setup() {
        let showMenuUp = ref(!stateMain.data.fullscreen)
        stateMain.func.onFullScreen(() => {
            showMenuUp.value = !stateMain.data.fullscreen
        })
        state.func.start()

        return {
            state,
            showMenuUp
        }
    }
}
</script>