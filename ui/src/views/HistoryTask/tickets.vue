<template>
    <div v-if="item && item.stat && item.stat.length > 0">
        <q-table
            flat
            square
            virtual-scroll
            hide-bottom
            v-model:pagination="pagination1"
            separator="none"
            :rows-per-page-options="[0]"
            :virtual-scroll-sticky-size-start="48"
            row-key="idx"
            :rows="item.stat"
            :columns="[
                {name: 'dateStart', label: 'start', field: 'dateStart', sortable: true, style: 'width: 200px', align: 'left'},
                {name: 'dateStop', label: 'stop', field: 'dateStart', sortable: true, style: 'width: 200px', align: 'left'},
                {name: 'duration', label: 'duration', field: 'duration', sortable: true, style: 'width: 200px', align: 'left'},
                {name: 'ticket', label: 'ticket', align: 'left'}
            ]">
            <template v-slot:body="props">
                <q-tr :props="props" :class="props.row.hasError ? 'text-negative' : undefined">
                    <q-td key="dateStart" :props="props">
                        {{ showDateTime(props.row.dateStart) }}
                    </q-td>
                    <q-td key="dateStop" :props="props">
                        {{ showDateTime(props.row.dateStop) }}
                    </q-td>
                    <q-td key="duration" :props="props">
                        {{ showMsec(props.row.duration) }}
                    </q-td>
                    <q-td key="ticket" :props="props">
                        <div style="display: flex">
                            {{ props.row.file }}
                            <q-btn dense flat color="accent" size="sm" label="download" @click="downloadFile('ticket', props.row.path, props.row.file, '0')" style="margin: 0px 0px 0px 10px"/>
                            <q-btn-dropdown
                                flat
                                dense
                                size="sm"
                                color="accent"
                                label="view"
                                style="margin: 0px 0px 0px 5px"
                            >
                                <div>
                                    <q-table
                                        flat
                                        square
                                        virtual-scroll
                                        hide-bottom
                                        v-model:pagination="pagination2"
                                        separator="none"
                                        :rows-per-page-options="[0]"
                                        :virtual-scroll-sticky-size-start="48"
                                        row-key="idxs"
                                        :rows="props.row.data.servers"
                                        style="width: calc(100vw / 2); height: calc(100vh / 1.5 - 15px); overflow-y: hidden; overflow-x: hidden"
                                        :columns="[
                                            {name: 'instance', label: 'instance', field: 'instance', sortable: true, style: 'width: 200px', align: 'left'},
                                            {name: 'execDurationMsec', label: 'duration', field: 'execDurationMsec', sortable: true, style: 'width: 200px', align: 'left'},
                                            {name: 'countRows', label: 'download rows', field: 'countRows', sortable: true, style: 'width: 150px', align: 'left'},
                                            {name: 'countMessages', label: 'download msgs', field: 'countMessages', sortable: true, style: 'width: 150px', align: 'left'},
                                            {name: 'execSpId', label: 'spid', field: 'execSpId', sortable: true, style: 'width: 100px', align: 'left'},
                                            {name: 'idxs', label: 'idxs', field: 'idxs', sortable: true, style: 'width: 100px', align: 'left'},
                                            {name: 'execError', label: 'execError', field: 'execError', sortable: true, align: 'left'},
                                        ]">
                                        <template v-slot:body="props2">
                                            <q-tr :props="props2" :class="props2.row.execError ? 'text-negative' : undefined">
                                                <q-td key="instance" :props="props2">
                                                    {{ props2.row.instance }}
                                                </q-td>
                                                <q-td key="execDurationMsec" :props="props2">
                                                    {{ showMsec(props2.row.execDurationMsec) }}
                                                </q-td>
                                                <q-td key="countRows" :props="props2">
                                                    <q-btn v-if="props2.row.countRows > 0" dense flat color="accent" size="sm"
                                                        :label="props2.row.countRows + ' row(s)'"
                                                        @click="downloadFile('row', props.row.path, props.row.file, props2.row.idxs)"/>
                                                </q-td>
                                                <q-td key="countMessages" :props="props2">
                                                    <q-btn v-if="props2.row.countMessage > 0" dense flat color="accent" size="sm"
                                                        :label="props2.row.countMessage + ' msg(s)'"
                                                        @click="downloadFile('msg', props.row.path, props.row.file, props2.row.idxs)"/>
                                                </q-td>
                                                <q-td key="execSpId" :props="props2">
                                                    {{ props2.row.execSpId }}
                                                </q-td>
                                                <q-td key="idxs" :props="props2">
                                                    {{ props2.row.idxs }}
                                                </q-td>
                                                <q-td key="execError" :props="props2">
                                                    {{ props2.row.execError }}
                                                </q-td>
                                            </q-tr>
                                        </template>
                                    </q-table>
                                </div>
                            </q-btn-dropdown>
                        </div>
                    </q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>
<script lang="ts">
import { ref } from 'vue'
import { TTaskServiceStat } from './state'
import * as env from '@/core/_env'

export default {
    props: {
        item: undefined as TTaskServiceStat | undefined
    },
    setup() {
        const downloadFile = (type: string, path: string, file: string, idxs: string) => {
            env.api.historyTaskItemDownload({type: type as any, pathTicket: path, fileTicket: file, serverIdxs: idxs}, (blob, filename) => {
                if (!blob || !filename) return
                const link = document.createElement("a")
                link.href = window.URL.createObjectURL(blob)
                link.download = filename
                link.click()
            })
        }

        return {
            showDateTime: env.showDateTime,
            showMsec: env.showMsec,
            pagination1: ref({
                rowsPerPage: 0
            }),
            pagination2: ref({
                rowsPerPage: 0
            }),
            downloadFile,
        }
    }
}
</script>