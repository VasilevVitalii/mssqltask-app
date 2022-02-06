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
                    {name: 'queries', label: 'queries', field: 'item.state.queries', style: 'width: 100px', align: 'left'},
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
                                <div style="margin: 10px; display: grid">
                                    <q-checkbox :false-value="false || null" v-model="props.row.item.state.metronom.weekdaySun" label="sunday" style="margin: 0px 0px 0px 30px" />
                                    <q-checkbox :false-value="false || null" v-model="props.row.item.state.metronom.weekdayMon" label="monday" style="margin: 0px 0px 0px 30px" />
                                    <q-checkbox :false-value="false || null" v-model="props.row.item.state.metronom.weekdayTue" label="tuesday" style="margin: 0px 0px 0px 30px" />
                                    <q-checkbox :false-value="false || null" v-model="props.row.item.state.metronom.weekdayWed" label="wednesday" style="margin: 0px 0px 0px 30px" />
                                    <q-checkbox :false-value="false || null" v-model="props.row.item.state.metronom.weekdayThu" label="thursday" style="margin: 0px 0px 0px 30px" />
                                    <q-checkbox :false-value="false || null" v-model="props.row.item.state.metronom.weekdayFri" label="friday" style="margin: 0px 0px 0px 30px" />
                                    <q-checkbox :false-value="false || null" v-model="props.row.item.state.metronom.weekdaySat" label="saturday" style="margin: 0px 0px 0px 30px" />
                                    <div style="display: flex; align-items: center">
                                        <div style="width: 100px">
                                            <q-btn-dropdown dense color="accent" flat :label="props.row.item.state.metronom.periodicity || '???'">
                                                <q-list>
                                                    <q-item clickable v-close-popup @click="props.row.item.state.metronom.periodicity = 'every'">
                                                    <q-item-section>
                                                        <q-item-label>EVERY</q-item-label>
                                                    </q-item-section>
                                                    </q-item>

                                                    <q-item clickable v-close-popup @click="props.row.item.state.metronom.periodicity = 'once'">
                                                    <q-item-section>
                                                        <q-item-label>ONCE</q-item-label>
                                                    </q-item-section>
                                                    </q-item>
                                                </q-list>
                                            </q-btn-dropdown>
                                        </div>
                                        <q-input
                                            borderless
                                            style="width: 130px"
                                            v-model="props.row.item.state.metronom.periodMinutes"
                                            :label="'minutes' + (props.row.item.state.metronom.periodicity === 'every' ? ' every hour' : props.row.item.state.metronom.periodicity === 'once' ? ' after midnight' : '')"
                                        />
                                    </div>
                                </div>
                            </q-btn-dropdown>
                        </div>
                    </q-td>
                    <q-td key="schedule" :props="props">
                        <q-btn-dropdown dense color="accent" flat label="edit">
                            <div>
                                <q-btn dense flat color="accent" size="sm" style="margin: 0px 0px 0px 5px" label="add"/>
                            </div>
                        </q-btn-dropdown>
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