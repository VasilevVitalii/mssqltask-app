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
                            label: 'ticket',
                            field: 'file',
                            sortable: true,
                            style: 'width: 200px',
                            align: 'left'
                        },
                        {
                            name: 'result',
                            label: 'result by servers',
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
                                <q-btn flat dense size="sm" color="primary" :label="props.row.file" @click="download('ticket', '', props.row.file)" />
                            </q-td>
                            <q-td key="result" :props="props">
                                <div v-if="props.row.result">
                                    <q-btn-dropdown
                                        v-if="props.row.countExecSuccess > 0"
                                        flat
                                        dense
                                        size="sm"
                                        color="primary"
                                        :label="'success (' + props.row.countExecSuccess + ')'">
                                        <div style="width: calc(100vw / 1.5); height: calc(100vh / 2); overflow-y: hidden; overflow-x: hidden">
                                            <q-table
                                                flat
                                                square
                                                virtual-scroll
                                                hide-bottom
                                                v-model:pagination="paginationSuccess"
                                                separator="none"
                                                class="my-table-mssql"
                                                :rows-per-page-options="[0]"
                                                :virtual-scroll-sticky-size-start="48"
                                                row-key="idx"
                                                :rows="props.row.result.servers.filter(f => !f.execError)"
                                                :columns="[
                                                    {
                                                        name: 'instance',
                                                        label: 'instance',
                                                        field: 'instance',
                                                        sortable: true,
                                                        style: 'width: 200px',
                                                        align: 'left'
                                                    },
                                                    {
                                                        name: 'execSpId',
                                                        label: 'exec spid',
                                                        field: 'execSpId',
                                                        sortable: true,
                                                        style: 'width: 200px',
                                                        align: 'left'
                                                    },
                                                    {
                                                        name: 'execDurationMsec',
                                                        label: 'exec duration (msec)',
                                                        field: 'execDurationMsec',
                                                        sortable: true,
                                                        style: 'width: 200px',
                                                        align: 'left'
                                                    },
                                                    {
                                                        name: 'countRows',
                                                        label: 'rows',
                                                        field: 'countRows',
                                                        sortable: true,
                                                        style: 'width: 200px',
                                                        align: 'left'
                                                    },
                                                    {
                                                        name: 'countMessages',
                                                        label: 'messages',
                                                        field: 'countMessages',
                                                        style: 'width: 200px',
                                                        align: 'left'
                                                    }
                                                ]">
                                                <template v-slot:body="props2">
                                                    <q-tr :props="props2">
                                                        <q-td key="instance" :props="props2">
                                                            {{ props2.row.instance }}
                                                        </q-td>
                                                        <q-td key="execSpId" :props="props2">
                                                            {{ props2.row.execSpId }}
                                                        </q-td>
                                                        <q-td key="execDurationMsec" :props="props2">
                                                            {{ props2.row.execDurationMsec }}
                                                        </q-td>
                                                        <q-td key="countRows" :props="props2">
                                                            <q-btn v-if="props2.row.countRows > 0" flat dense size="sm" color="primary" :label="'download (' + props2.row.countRows + ')'" @click="download('row', props2.row.idxs, props.row.file)" />
                                                        </q-td>
                                                        <q-td key="countMessages" :props="props2">
                                                            <q-btn v-if="props2.row.countMessages > 0" flat dense size="sm" color="primary" :label="'download (' + props2.row.countMessages + ')'" @click="download('msg', props2.row.idxs, props.row.file)" />
                                                        </q-td>
                                                    </q-tr>
                                                </template>
                                            </q-table>
                                        </div>
                                    </q-btn-dropdown>
                                    <q-btn-dropdown
                                        v-if="props.row.countExecError > 0"
                                        flat
                                        dense
                                        size="sm"
                                        color="negative"
                                        :label="'error (' + props.row.countExecError + ')'">
                                        <div style="width: calc(100vw / 1.5); height: calc(100vh / 2); overflow-y: hidden; overflow-x: hidden">
                                        <q-table
                                                flat
                                                square
                                                virtual-scroll
                                                hide-bottom
                                                v-model:pagination="paginationSuccess"
                                                separator="none"
                                                class="my-table-mssql"
                                                :rows-per-page-options="[0]"
                                                :virtual-scroll-sticky-size-start="48"
                                                row-key="idx"
                                                :rows="props.row.result.servers.filter(f => f.execError)"
                                                :columns="[
                                                    {
                                                        name: 'instance',
                                                        label: 'instance',
                                                        field: 'instance',
                                                        sortable: true,
                                                        style: 'width: 200px',
                                                        align: 'left'
                                                    },
                                                    {
                                                        name: 'execError',
                                                        label: 'error',
                                                        field: 'execError',
                                                        sortable: true,
                                                        style: 'width: 200px',
                                                        align: 'left'
                                                    }
                                                ]">
                                            </q-table>
                                        </div>
                                    </q-btn-dropdown>
                                </div>
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

        const download = (kind: "ticket" | "row" | "msg", idxs: string, tiketFileName: string) => {
            state.download(kind, idxs, tiketFileName, (blob, fileName) => {
                if (!blob || !fileName) return
                const link = document.createElement("a")
                link.href = window.URL.createObjectURL(blob)
                link.download = fileName
                link.click()
            })
        }

        return {
            state,
            dFormat,
            tFormat,
            download,
            pagination: ref({
                rowsPerPage: 0
            }),
            paginationSuccess: ref({
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
