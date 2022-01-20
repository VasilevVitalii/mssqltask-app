<template>
    <div>
        <ComponentBuzy v-show="state.buzy" />
        <div v-show="!state.buzy && list().length > 0" style="display: flex">
            <q-list padding style="overflow-y: scroll; height: calc(100vh - 50px - 50px - 30px - 10px); width: 220px">
                <q-item v-for="(item, idx) in list()" :key="idx">
                    <q-item-section>
                        <q-item-label>
                            <div style="display: flex; align-items: center">
                                <q-btn flat @click="load(item.dd, item.tasks)" :label="dFormat(item.dd)"/>
                                <div class="div-info">{{ item.tasks.length }} task(s)</div>
                            </div>
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </div>
    </div>
</template>
<script lang="ts">
import { ref } from "vue"
import ComponentBuzy from "@/components/Buzy.vue"
import { state } from "@/state/taskLog"
import { dateFormat, toDate } from "vv-common"

export default {
    components: {
        ComponentBuzy
    },
    setup() {
        const dFormat = (d: string): string => {
            return dateFormat(toDate(d) || new Date(2000, 1, 1), "yyyy.mm.dd")
        }

        const list = (): {dd: string, tasks: string[]}[] => {
            const l: {dd: string, tasks: string[]}[] = []
            state.tasks.forEach(t => {
                t.dds.forEach(d => {
                    let fnd = l.find(f => f.dd === d)
                    if (!fnd) {
                        fnd = {dd: d, tasks: []}
                        l.push(fnd)
                    }
                    fnd.tasks.push(t.task)
                })
            })
            l.sort((a, b) => {
                if (a.dd > b.dd) return -1
                if (b.dd > a.dd) return 1
                return 0
            })
            return l
        }

        const load = (dd: string, tasks: string[]): void => {

        }

        return {
            state,
            list,
            load,
            dFormat
        }
    }
}
</script>
