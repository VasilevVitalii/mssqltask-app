<template>
    <div>
        <q-toolbar style="height: 50px">
            <q-btn flat @click="load()" :label="loadButtonName()" />
            <q-space />
            <q-btn-dropdown flat color="primary" :label="'show ' + pointEdit">
                <q-list>
                    <q-item clickable v-close-popup @click="pointEdit = 'task state'">
                        <q-item-section>
                            <q-item-label>task state</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="pointEdit = 'task log'">
                        <q-item-section>
                            <q-item-label>task log</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="pointEdit = 'service log'">
                        <q-item-section>
                            <q-item-label>service log</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-btn-dropdown>
        </q-toolbar>
        <ComponentTaskState v-show="pointEdit === 'task state'" />
        <ComponentTaskLog v-show="pointEdit === 'task log'" />
        <ComponentServiceLog v-show="pointEdit === 'service log'" />
    </div>
</template>
<script lang="ts">
import { ref } from "vue"
import ComponentServiceLog from "./serviceLog.vue"
import ComponentTaskLog from "./taskLog.vue"
import ComponentTaskState from "./taskState.vue"

import { state as serviceLogState } from "@/state/serviceLog"
import { state as taskLogState } from "@/state/taskLog"
import * as vv from "vv-common"

export default {
    components: {
        ComponentServiceLog,
        ComponentTaskLog,
        ComponentTaskState
    },
    setup() {
        let pointEdit = ref("task state")

        const load = () => {
            if (pointEdit.value === "task log" || pointEdit.value === "task state") {
                taskLogState.load()
            } else if (pointEdit.value === "service log") {
                serviceLogState.load()
            }
        }

        const loadButtonName = (): string => {
            if (pointEdit.value === "service log" && !serviceLogState.loadedInit) return "load"
            if ((pointEdit.value === "task log" || pointEdit.value === "task state") && !taskLogState.loadedInit) return "load"
            return "reload"
        }

        return {
            pointEdit,
            load,
            loadButtonName
        }
    }
}
</script>
<style lang="sass" scoped>
.noactive
    opacity: 0.8
</style>
