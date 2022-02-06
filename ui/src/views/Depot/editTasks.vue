<template>
    <q-table
                flat
                square
                virtual-scroll
                hide-bottom
                v-model:pagination="pagination"
                separator="none"
                :rows-per-page-options="[0]"
                :virtual-scroll-sticky-size-start="48"
                row-key="idx"
                :rows="state.data.tasks"
                :columns="[
                    {name: 'title', label: 'title', field: 'item.state.title', sortable: true, style: 'width: 200px', align: 'left'},
                    {name: 'key', label: 'uniq key', field: 'item.state.key', sortable: true, style: 'width: 200px', align: 'left'},
                    {name: 'allow', label: 'enabled, allow rows and messages', style: 'width: 200px', align: 'left'},
                    {name: 'schedule', label: 'schedule', field: 'item.state.metronom', style: 'width: 200px', align: 'left'},
                ]">
            <template v-slot:body="props">
                <q-tr :props="props" :class="props.row.isDel ? 'bg-negative-light' : props.row.isNew || props.row.item.getUpdProps().length > 0 ? 'bg-positive-light' : undefined">
                    <q-td key="title" :props="props">
                        <q-input borderless placeholder="title" v-model="props.row.item.state.title"/>
                    </q-td>
                    <q-td key="key" :props="props">
                        <q-input borderless placeholder="key" v-model="props.row.item.state.key"/>
                    </q-td>
                    <q-td key="allow" :props="props">
                        <q-checkbox v-model="props.row.item.state.allowExec"/>
                        <q-checkbox v-model="props.row.item.state.allowRows"/>
                        <q-checkbox v-model="props.row.item.state.allowMessages"/>
                    </q-td>
                    <q-td key="schedule" :props="props">
                        <div style="display: flex">
                            <q-btn-dropdown dense color="accent" flat :label="props.row.item.state.metronom.kind">
                                <q-list>
                                    <q-item clickable v-close-popup @click="props.row.item.state.metronom.kind = 'cron'">
                                    <q-item-section>
                                        <q-item-label>CRON</q-item-label>
                                    </q-item-section>
                                    </q-item>

                                    <q-item clickable v-close-popup @click="props.row.item.state.metronom.kind = 'custom'">
                                    <q-item-section>
                                        <q-item-label>CUSTOM</q-item-label>
                                    </q-item-section>
                                    </q-item>
                                </q-list>
                            </q-btn-dropdown>
                            <q-input v-show="props.row.item.state.metronom.kind === 'cron'" borderless placeholder="text cron" v-model="props.row.item.state.metronom.cron"/>
                            <q-btn-dropdown dense color="accent" flat label="edit" v-show="props.row.item.state.metronom.kind === 'custom'">
                                <div>
                                    <q-checkbox v-model="props.row.item.state.metronom.weekdaySun" label="sunday" />
                                    <q-checkbox v-model="props.row.item.state.metronom.weekdayMon" label="monday" />
                                    <q-checkbox v-model="props.row.item.state.metronom.weekdayTue" label="tuesday" />
                                    <q-checkbox v-model="props.row.item.state.metronom.weekdayWed" label="wednesday" />
                                    <q-checkbox v-model="props.row.item.state.metronom.weekdayThu" label="thursday" />
                                    <q-checkbox v-model="props.row.item.state.metronom.weekdayFri" label="friday" />
                                    <q-checkbox v-model="props.row.item.state.metronom.weekdaySat" label="saturday" />
                                    <q-separator style="margin: 5px 10px 5px 10px" color="primary" />
                                    <q-btn-toggle
                                        v-model="props.row.item.state.metronom.periodicity"
                                        toggle-color="accent" flat dense
                                        :options="[{label: 'every', value: 'every'},{label: 'once', value: 'once'}]"
                                    />
                                    <q-input borderless label="period in minutes" v-model="props.row.item.state.metronom.periodMinutes"/>
                                </div>
                            </q-btn-dropdown>
                        </div>
                    </q-td>
                </q-tr>
            </template>
    </q-table>
</template>
<script lang="ts">
import { ref } from 'vue'
import { state, TServer } from './state'
import * as ve from "vv-entity"
import * as env from '@/core/_env'

export default {
    setup() {
        return {
            state,
            env,
            pagination: ref({
                rowsPerPage: 0
            })
        }
    }
}
</script>