<template>
    <ComponentBuzy v-show="state.data.buzy" />
    <div v-show="!state.data.buzy">
        <div style="display: flex">
            <div style="overflow-y: scroll; height: calc(100vh - 50px - 30px - 20px); width: 330px; margin: 10px 0px 10px 0px">
                <ComponentMenuLeft/>
            </div>
            <div style="overflow-y: scroll; height: calc(100vh - 50px - 30px - 20px); width: calc(100vw - 330px)">
                <ComponentTickets :item="state.data.itemView"/>
            </div>
        </div>
        <ComponentStatus/>
    </div>
</template>
<script lang="ts">
import { ref } from 'vue'
import ComponentBuzy from '@/components/Buzy.vue'
import ComponentMenuLeft from './menuLeft.vue'
import ComponentTickets from './tickets.vue'
import ComponentStatus from './status.vue'
import { state } from './state'
import * as env from '@/core/_env'

export default {
    components: {
        ComponentBuzy,
        ComponentMenuLeft,
        ComponentTickets,
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