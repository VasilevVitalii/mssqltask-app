<template>
    <div>
        <q-toolbar style="height: 50px">
            <q-btn flat @click="load()" :label="loadButtonName()" />
            <q-space />
            <q-btn-dropdown flat color="primary" :label="'show ' + pointEdit">
                <q-list>
                    <q-item clickable v-close-popup @click="pointEdit = 'task log'">
                        <q-item-section>
                            <q-item-label>task log</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="pointEdit = 'task performance'">
                        <q-item-section>
                            <q-item-label>task performance</q-item-label>
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
        <ComponentTaskLog v-show="pointEdit === 'task log'" />
        <ComponentTaskPerformance v-show="pointEdit === 'task performance'" />
        <ComponentServiceLog v-show="pointEdit === 'service log'" />
    </div>
</template>
<script lang="ts">
import { ref } from "vue"
import ComponentServiceLog from "./serviceLog.vue"
import ComponentTaskLog from "./taskLog.vue"
import ComponentTaskPerformance from "./taskPerformance.vue"

import { state as serviceLogState } from "@/state/serviceLog"
import { state as taskLogState } from "@/state/taskLog"
import * as vv from "vv-common"

export default {
    components: {
        ComponentServiceLog,
        ComponentTaskLog,
        ComponentTaskPerformance
    },
    setup() {
        let pointEdit = ref("task log")

        const load = () => {
            if (pointEdit.value === "task log") {
                const dd2 = new Date()
                const dd1 = vv.dateAdd(dd2, "day", -30) as Date
                taskLogState.load(dd1, dd2)
            } else if (pointEdit.value === "task performance") {
                console.log("under constraction")
            } else if (pointEdit.value === "service log") {
                const dd2 = new Date()
                const dd1 = vv.dateAdd(dd2, "day", -30) as Date
                serviceLogState.load(dd1, dd2)
            }
        }

        const loadButtonName = (): string => {
            if (pointEdit.value === "service log" && !serviceLogState.loadedInit) return "load"
            if (pointEdit.value === "task log" && !taskLogState.loadedInit) return "load"
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
