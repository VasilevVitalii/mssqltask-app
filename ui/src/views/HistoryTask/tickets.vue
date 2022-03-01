<template>
    <div v-if="item && item.stat && item.stat.length > 0">
        <q-btn flat color="accent" label="reload" style="margin: 10px 0px 0px 5px" @click="state.func.loadStat([item])" />
        <q-table
            ref="tabData"
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
                            <q-btn dense flat color="accent" size="sm" label="download" @click="downloadFile('ticket', props.row.path, props.row.file, '0')" style="margin: 0px 0px 0px 10px"/>
                            <q-btn-dropdown
                                flat
                                dense
                                size="sm"
                                color="accent"
                                label="view"
                                style="margin: 0px 0px 0px 5px"
                            >
                                <div style="width: calc(100vw / 1.5); height: calc(100vh / 2)">
                                    <q-input borderless v-model="state.data.itemFilter" placeholder="filter by title and instance" input-style="min-width: 200px" style="margin: 10px">
                                        <template v-slot:prepend>
                                            <q-icon v-if="state.data.itemFilter === ''" name="search" />
                                            <q-icon v-else name="clear" class="cursor-pointer" @click="state.data.itemFilter = ''" />
                                        </template>
                                    </q-input>
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
                                        :rows="list(props.row.data?.servers || [])"
                                        style="width: calc(100vw / 1.5); display: table-row;"
                                        :columns="[
                                            {name: 'title', label: 'title', field: 'title', sortable: true, style: 'width: 200px; max-width: 500px', align: 'left'},
                                            {name: 'instance', label: 'instance', field: 'instance', sortable: true, style: 'width: 200px; max-width: 400px', align: 'left'},
                                            {name: 'execDurationMsec', label: 'duration', field: 'execDurationMsec', sortable: true, style: 'width: 200px', align: 'left'},
                                            {name: 'countRows', label: 'download rows', field: 'countRows', sortable: true, style: 'width: 150px', align: 'left'},
                                            {name: 'countMessages', label: 'download msgs', field: 'countMessages', sortable: true, style: 'width: 150px', align: 'left'},
                                            {name: 'execSpId', label: 'spid', field: 'execSpId', sortable: true, style: 'width: 100px', align: 'left'},
                                            {name: 'idxs', label: 'idxs', field: 'idxs', sortable: true, style: 'width: 100px', align: 'left'},
                                            {name: 'execError', label: 'execError', field: 'execError', sortable: true, align: 'left', style: 'max-width: 400px'},
                                        ]">
                                        <template v-slot:body="props2">
                                            <q-tr :props="props2" :class="props2.row.execError ? 'text-negative' : undefined">
                                                <q-td key="title" :props="props2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;align-self: center">
                                                    <span> {{ props2.row.title }} </span>
                                                </q-td>
                                                <q-td key="instance" :props="props2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;align-self: center">
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
                                                    <q-btn v-if="props2.row.countMessages > 0" dense flat color="accent" size="sm"
                                                        :label="props2.row.countMessages + ' msg(s)'"
                                                        @click="downloadFile('msg', props.row.path, props.row.file, props2.row.idxs)"/>
                                                </q-td>
                                                <q-td key="execSpId" :props="props2">
                                                    {{ props2.row.execSpId }}
                                                </q-td>
                                                <q-td key="idxs" :props="props2">
                                                    {{ props2.row.idxs }}
                                                </q-td>
                                                <q-td key="execError" :props="props2">
                                                    <span style="white-space: normal"> {{ props2.row.execError }} </span>
                                                </q-td>
                                            </q-tr>
                                        </template>
                                    </q-table>
                                </div>
                            </q-btn-dropdown>
                            <span  style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"> {{ props.row.file }} </span>
                        </div>
                    </q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>
<script lang="ts">
import { ref } from 'vue'
import { TTaskService, TTaskServiceStat, state } from './state'
import * as env from '@/core/_env'
import { TReplyHistoryTaskDayDataServer } from "../../../../src/api/onPost"

export default {
    props: {
        item: undefined as TTaskService | undefined
    },
    setup(props: any) {
        const downloadFile = (type: string, path: string, file: string, idxs: string) => {
            env.api.historyTaskItemDownload({type: type as any, pathTicket: path, fileTicket: file, serverIdxs: idxs}, (blob, filename) => {
                if (!blob || !filename) return
                const link = document.createElement("a")
                link.href = window.URL.createObjectURL(blob)
                link.download = filename
                link.click()
            })
        }

        const list = (servers: any[]) => {
            if (!state.data.itemFilter) return servers
            const sf = state.data.itemFilter.toLowerCase()
            return servers.filter((f: any) =>
                (f.title && f.title.toLowerCase().indexOf(sf) >= 0) ||
                (f.instance && f.instance.toLowerCase().indexOf(sf) >= 0) ||
                (f.execError && f.execError.toLowerCase().indexOf(sf) >= 0)
            )
        }

        return {
            showDateTime: env.showDateTime,
            showMsec: env.showMsec,
            state,
            pagination1: ref({
                rowsPerPage: 0
            }),
            pagination2: ref({
                rowsPerPage: 0
            }),
            downloadFile,
            list
        }
    }
}
</script>