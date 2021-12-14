q-td
<template>
    <div>
        <q-table
            flat
            square
            virtual-scroll
            hide-bottom
            v-model:pagination="pagination"
            separator="none"
            class="my-table-task"
            :rows-per-page-options="[0]"
            :virtual-scroll-sticky-size-start="48"
            row-key="idx"
            :rows="state.tasks"
            :columns="[
                {
                    name: 'key',
                    label: 'uniq key',
                    sortable: true,
                    style: 'width: 150px',
                    align: 'left'
                },
                {
                    name: 'title',
                    label: 'title',
                    sortable: true,
                    align: 'left'
                },
                {
                    name: 'allowSave',
                    label: 'save msg & rows',
                    style: 'width: 100px',
                    align: 'left'
                },
                {
                    name: 'metronom',
                    label: 'schedule',
                    style: 'width: 200px',
                    align: 'left'
                },
                {
                    name: 'queries',
                    label: 'queries',
                    style: 'width: 50px',
                    align: 'left'
                },
                {
                    name: 'mssqls',
                    label: 'mssqls',
                    style: 'width: 100px',
                    align: 'left'
                },
                { name: 'state', style: 'width: 350px' }
            ]">
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="key" :props="props">
                        <q-input dense v-model="props.row.edit.key" borderless placeholder="enter key"> </q-input>
                    </q-td>
                    <q-td key="title" :props="props">
                        <q-input dense v-model="props.row.edit.title" borderless placeholder="enter title"> </q-input>
                    </q-td>
                    <q-td key="allowSave" :props="props">
                        <q-checkbox v-model="props.row.edit.allowMessages" />
                        <q-checkbox v-model="props.row.edit.allowRows" />
                    </q-td>
                    <q-td key="metronom" :props="props">
                        <div style="display: flex">
                            <q-btn-dropdown flat dense size="sm" color="primary" :label="props.row.edit.metronom.kind" style="margin: 2px 5px 0px 0px">
                                <q-list>
                                    <q-item clickable v-close-popup @click="props.row.edit.metronom.kind = 'cron'">
                                        <q-item-section>
                                            <q-item-label>cron</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup @click="props.row.edit.metronom.kind = 'custom'">
                                        <q-item-section>
                                            <q-item-label>custom</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </q-btn-dropdown>
                            <q-input
                                dense
                                v-model="props.row.edit.metronom.cron"
                                v-show="props.row.edit.metronom.kind === 'cron'"
                                borderless
                                placeholder="enter cron" />
                            <q-btn-dropdown
                                v-show="props.row.edit.metronom.kind === 'custom'"
                                flat
                                dense
                                size="sm"
                                color="primary"
                                label="change"
                                style="margin: 2px 5px 0px 0px">
                                <q-list dense style="width: 200px">
                                    <q-item class="metronom-list">
                                        <q-checkbox v-model="props.row.edit.metronom.weekdaySun" label="sunday" />
                                    </q-item>
                                    <q-item class="metronom-list">
                                        <q-checkbox v-model="props.row.edit.metronom.weekdayMon" label="monday" />
                                    </q-item>
                                    <q-item class="metronom-list">
                                        <q-checkbox v-model="props.row.edit.metronom.weekdayTue" label="tuesday" />
                                    </q-item>
                                    <q-item class="metronom-list">
                                        <q-checkbox v-model="props.row.edit.metronom.weekdayWed" label="wednesday" />
                                    </q-item>
                                    <q-item class="metronom-list">
                                        <q-checkbox v-model="props.row.edit.metronom.weekdayThu" label="thursday" />
                                    </q-item>
                                    <q-item class="metronom-list">
                                        <q-checkbox v-model="props.row.edit.metronom.weekdayFri" label="friday" />
                                    </q-item>
                                    <q-item class="metronom-list">
                                        <q-checkbox v-model="props.row.edit.metronom.weekdaySat" label="saturday" />
                                    </q-item>
                                    <q-item class="metronom-list">
                                        <q-btn-toggle
                                            unelevated
                                            dense
                                            v-model="props.row.edit.metronom.periodicity"
                                            :options="[
                                                { label: 'every', value: 'every' },
                                                { label: 'once', value: 'once' }
                                            ]" />
                                    </q-item>
                                    <q-item>
                                        <q-input
                                            style="margin: 10px 0px 10px 0px"
                                            dense
                                            v-model="props.row.edit.metronom.number"
                                            outlined
                                            square
                                            :label="props.row.edit.metronom.periodicity === 'every' ? 'period in min' : 'mins after midnight'">
                                        </q-input>
                                    </q-item>
                                </q-list>
                            </q-btn-dropdown>
                        </div>
                    </q-td>
                    <q-td key="queries" :props="props">
                        <!-- <q-btn
                            flat
                            dense
                            size="sm"
                            color="primary"
                            :label="props.row.edit.queries.some(f => f.trim().length > 0) ? 'change' : 'set'"
                            style="margin: 2px 0px 0px 0px" /> -->
                        <q-btn-dropdown
                            flat
                            dense
                            size="sm"
                            color="primary"
                            :label="props.row.edit.queries.some(f => f.trim().length > 0) ? 'change' : 'set'"
                            style="margin: 2px 5px 0px 0px">
                            <!-- <q-list dense style="width: calc(100vw / 2); height: calc(100vh / 2)"> -->
                            <q-toolbar style="width: calc(100vw / 2); height: calc(100vh / 2)">
                                <q-tabs v-model="tab" shrink stretch>
                                    <q-tab name="tab1" label="Tab 1" />
                                    <q-tab name="tab2" label="Tab 2" />
                                    <q-tab name="tab3" label="Tab 3" />
                                </q-tabs>
                                <q-space />
                                <q-btn flat label="add" />
                            </q-toolbar>
                        </q-btn-dropdown>
                    </q-td>
                    <q-td key="mssqls" :props="props">
                        <q-btn flat dense size="sm" color="primary" :label="'link (' + props.row.mates().length + ')'" style="margin: 2px 0px 0px 0px" />
                    </q-td>
                    <q-td key="state" :props="props">
                        <div style="display: flex; margin: 2px 0px 0px 0px">
                            <div v-show="!props.row.del && props.row.upd()" style="display: flex">
                                <q-btn flat dense size="sm" color="primary" @click="props.row.edit = JSON.parse(JSON.stringify(props.row.load))"
                                    >undo change</q-btn
                                >
                                <q-separator vertical style="margin: 0px 5px 0px 5px"></q-separator>
                            </div>
                            <div v-show="props.row.new()" style="display: flex">
                                <q-btn flat dense size="sm" color="primary" @click="state.mssqls = state.mssqls.filter(f => f.idx !== props.row.idx)"
                                    >undo add</q-btn
                                >
                                <q-separator vertical style="margin: 0px 5px 0px 5px"></q-separator>
                            </div>
                            <div v-show="!props.row.new()" style="display: flex">
                                <q-btn flat dense size="sm" color="primary" v-show="props.row.del" @click="props.row.del = false">undo delete</q-btn>
                                <q-btn flat dense size="sm" color="primary" v-show="!props.row.del" @click="props.row.del = true">delete</q-btn>
                                <q-separator vertical style="margin: 0px 5px 0px 5px"></q-separator>
                            </div>

                            <q-btn flat dense size="sm" color="primary" @click="cloneItem(props.row.idx)">clone</q-btn>
                        </div>
                    </q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, reactive } from "vue"
import { state, TTaskEntity } from "@/state/edit"
import { send } from "@/core/rest"
import { TReplyConnection } from "../../../../src/api"
import { notify, promt } from "@/core/dialog"
import { TypeMetronom } from "vv-metronom"

export default defineComponent({
    setup() {
        // const editItems = reactive([]) as { kind: "metronom" | "queries" | "mssqls"; item: TTaskEntity }[]

        const cloneItem = (idx: number) => {
            const parentItem = state.tasks[idx]
            const cloneItem = state.newTask()
            cloneItem.edit = JSON.parse(JSON.stringify(parentItem.edit))
            cloneItem.edit.title = `${cloneItem.edit.title} - clone`
            cloneItem.edit.path = ""
            cloneItem.edit.file = ""
            state.tasks.push(cloneItem)
        }

        // const addItem = (idx: number, kind: "metronom" | "queries" | "mssqls") => {
        //     const item = state.tasks.find(f => f.idx === idx)
        //     if (!item) return
        //     console.log(editItems.length)
        //     if (editItems.some(f => f.kind === kind && f.item === item)) return
        //     editItems.push({ kind, item })
        // }

        return {
            pagination: ref({
                rowsPerPage: 0
            }),
            state,
            cloneItem,
            editMetronomTask: undefined as TypeMetronom | undefined,
            splitterModel: ref(50)
            //editItems,
            //addItem
        }
    }
})
</script>
<style lang="sass">
.my-table-task
    height: calc(100vh - 50px - 50px - 30px - 10px)
    .q-table__top,
    thead tr:first-child th
        background-color: white
    thead tr th
        position: sticky
        z-index: 1
    thead tr:first-child th
        top: 0
</style>
