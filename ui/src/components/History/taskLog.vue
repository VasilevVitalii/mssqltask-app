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
                                <q-btn-dropdown flat dense size="sm" color="primary" label="open" auto-close push>
                                    <div style="margin: 10px">
                                        <div style="display: flex; flex-flow: wrap">
                                            <div v-for="(dd, idx) in item.dds" :key="idx">
                                                <q-btn
                                                    style="margin: 5px"
                                                    flat
                                                    dense
                                                    color="primary"
                                                    :label="dFormat(dd)"
                                                    @click="state.loadTickets(item, dd)" />
                                            </div>
                                        </div>
                                    </div>
                                </q-btn-dropdown>
                            </div>
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
            <div style="width: calc(100% - 270px)" v-show="state.tickets.list.length > 0">
                <q-table
                    flat
                    square
                    virtual-scroll
                    hide-bottom
                    v-model:pagination="pagination"
                    separator="none"
                    class="my-table-mssql"
                    :rows-per-page-options="[0]"
                    :virtual-scroll-sticky-size-start="48"
                    row-key="idx"
                    :rows="state.tickets.list"
                    :columns="[
                        {
                            name: 'dateStart',
                            label: 'start',
                            field: 'dateStart',
                            sortable: true,
                            style: 'width: 200px',
                            align: 'left'
                        },
                        {
                            name: 'dateStop',
                            label: 'stop',
                            field: 'dateStop',
                            sortable: true,
                            style: 'width: 200px',
                            align: 'left'
                        },
                        {
                            name: 'duration',
                            label: 'duration',
                            field: 'duration',
                            sortable: true,
                            style: 'width: 200px',
                            align: 'left'
                        },
                        {
                            name: 'file',
                            label: 'file',
                            field: 'file',
                            sortable: true,
                            style: 'width: 200px',
                            align: 'left'
                        },
                        {
                            name: 'result',
                            label: 'result (servers total / success/ error)',
                            field: 'result',
                            style: 'width: 200px',
                            align: 'left'
                        }
                    ]">
                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td key="dateStart" :props="props">
                                <div v-if="props.row.result">{{ tFormat(props.row.result.dateStart) }}</div>
                            </q-td>
                            <q-td key="dateStop" :props="props">
                                <div v-if="props.row.result">{{ tFormat(props.row.result.dateStop) }}</div>
                            </q-td>
                            <q-td key="duration" :props="props">
                                <div v-if="props.row.result">{{ props.row.durationText }}</div>
                            </q-td>
                            <q-td key="file" :props="props">
                                <div v-if="props.row.result">{{ props.row.file }}</div>
                            </q-td>
                            <q-td key="result" :props="props">
                                <div v-if="props.row.result">{{ props.row.file }}</div>
                            </q-td>
                        </q-tr>
                    </template>
                </q-table>
            </div>
        </div>
        <div class="text-white bg-primary fixed-bottom" style="height: 30px; width: 100%; display: flex">
            <div style="align-self: center; margin: 0px 5px 0px 5px" class="noactive" v-show="state.tickets.task">
                show {{ state.tickets.task?.task }} on date {{ dFormat(state.tickets?.d) }}, {{ state.tickets.list.length }} line(s)
            </div>
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

        const tFormat = (d: string): string => {
            return dateFormat(toDate(d) || new Date(2000, 1, 1), "hh:mi:ss.msec")
        }

        return {
            state,
            dFormat,
            tFormat,
            pagination: ref({
                rowsPerPage: 0
            })
        }
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
