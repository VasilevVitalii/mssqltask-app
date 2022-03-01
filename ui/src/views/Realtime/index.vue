<template>
    <ComponentMenuUp/>
    <ComponentServers v-if="state.func.showDetailsByTask()"/>
    <ComponentTasks v-else/>
</template>
<script lang="ts">
import { ref } from 'vue'
import { state } from './state'
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
        state.func.start()
        return {
            state
        }
    }
}
</script>