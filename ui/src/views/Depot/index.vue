<template>
    <ComponentBuzy v-show="state.data.buzy" />
    <div v-show="!state.data.buzy">
        <ComponentMenuUp/>
        <div style="overflow-y: scroll; height: calc(100vh - 50px - 50px - 30px); width: 100%">
            <ComponentEditServers v-show="state.data.viewBy === 'server'"/>
            <ComponentEditTasks v-show="state.data.viewBy === 'task'"/>
        </div>
        <ComponentStatus class="fixed-bottom"/>
    </div>
</template>
<script lang="ts">
import ComponentBuzy from '@/components/Buzy.vue'
import ComponentMenuUp from './menuUp.vue'
import ComponentEditServers from './editServers.vue'
import ComponentEditTasks from './editTasks.vue'
import ComponentStatus from './status.vue'
import { state } from './state'

export default {
    components: {
        ComponentBuzy,
        ComponentMenuUp,
        ComponentEditServers,
        ComponentEditTasks,
        ComponentStatus
    },
    setup() {
        if (state.data.countLoad === 0) {
            state.func.load()
        }
        return {
            state
        }
    }
}
</script>