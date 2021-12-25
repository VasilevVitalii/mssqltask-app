<template>
    <div>
        <ComponentBuzy v-show="state.buzy" />
        <div v-show="!state.buzy && state.tasks.length > 0" style="display: flex">
            <q-list padding style="overflow-y: scroll; height: calc(100vh - 50px - 50px - 30px - 10px); width: 270px">
                <q-item v-for="(item, idx) in state.tasks" :key="idx">
                    <q-item-section>
                        <q-item-label>
                            <div class="div-info">{{ item.task }}</div>
                            <div class="div-command2">
                                <q-btn-dropdown flat dense size="sm" color="primary" label="open">
                                    <div style="margin: 10px">
                                        <div style="display: flex; flex-flow: wrap">
                                            <div v-for="(dd, idx) in item.dds" :key="idx">
                                                <q-btn style="margin: 5px" flat dense color="primary" :label="dFormat(dd)" />
                                            </div>
                                        </div>
                                    </div>
                                </q-btn-dropdown>
                            </div>
                        </q-item-label>

                        <!-- <q-item-label v-show="item.visibleDates" v-for="(dd, idx) in item.item.dds" :key="idx" caption>
                            <div>
                                <div class="div-info">{{ dFormat(dd) }}</div>
                                <div class="div-command">
                                    <q-btn flat dense size="sm" color="primary" label="open" />
                                </div>
                            </div>
                        </q-item-label> -->
                    </q-item-section>
                </q-item>
            </q-list>
        </div>
    </div>
</template>
<script lang="ts">
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

        return { state, dFormat }
    }
}
</script>
<style lang="sass">
.div-info
    float: left
.div-command
    display: flex
    float: right
    margin: -4px 0px 0px 0px
.div-command2
    display: flex
    float: right
    margin: -2px 0px 0px 0px

.noactive
    opacity: 0.8
</style>
