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
                    style: 'width: 200px',
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
                    label: 'enabled / save msg / save rows',
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
                { name: 'commands', style: 'width: 350px' }
            ]">
            <template v-slot:body="props">
                <q-tr :props="props" :class="!props.row.isDel && (props.row.isNew || props.row.item.getUpdProps().length > 0) ? 'bg-info' : props.row.isDel ? 'bg-warning' : ''">
                    <q-td key="key" :props="props">
                        <q-input dense v-model="props.row.item.state.key" borderless placeholder="enter key" />
                    </q-td>
                    <q-td key="title" :props="props">
                        <q-input dense v-model="props.row.item.state.title" borderless placeholder="enter title"> </q-input>
                    </q-td>
                    <q-td key="allowSave" :props="props">
                        <q-checkbox v-model="props.row.item.state.allowExec" />
                        <q-checkbox v-model="props.row.item.state.allowMessages" />
                        <q-checkbox v-model="props.row.item.state.allowRows" />
                    </q-td>
                    <q-td key="metronom" :props="props">
                        <ComponentTaskItemMetronom :item="props.row" />
                    </q-td>
                    <q-td key="queries" :props="props">
                        <ComponentTaskItemQueries :item="props.row" />
                    </q-td>
                    <q-td key="mssqls" :props="props">
                        <ComponentTaskItemMssqls :item="props.row" />
                    </q-td>
                    <q-td key="commands" :props="props">
                        <div style="display: flex; margin: 2px 0px 0px 0px">
                            <div v-show="!props.row.isDel && !props.row.isNew && props.row.item.getUpdProps().length > 0" style="display: flex">
                                <q-btn flat dense size="sm" color="primary" @click="props.row.item.undo()" label="undo change" />
                                <q-separator vertical style="margin: 0px 5px 0px 5px"></q-separator>
                            </div>
                            <div v-show="props.row.isNew" style="display: flex">
                                <q-btn
                                    flat
                                    dense
                                    size="sm"
                                    color="primary"
                                    @click="state.tasks = state.tasks.filter(f => f.idx !== props.row.idx)"
                                    label="undo add" />
                                <q-separator vertical style="margin: 0px 5px 0px 5px"></q-separator>
                            </div>
                            <div v-show="!props.row.isNew" style="display: flex">
                                <q-btn flat dense size="sm" color="primary" v-show="props.row.isDel" @click="props.row.isDel = false" label="undo delete" />
                                <q-btn flat dense size="sm" color="primary" v-show="!props.row.isDel" @click="props.row.isDel = true" label="delete" />
                                <q-separator vertical style="margin: 0px 5px 0px 5px"></q-separator>
                            </div>
                            <q-btn flat dense size="sm" color="primary" @click="state.addTask(props.row)" label="clone" />
                        </div>
                    </q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue"
import { state } from "@/state/edit"

import ComponentTaskItemMetronom from "./taskItemMetronom.vue"
import ComponentTaskItemQueries from "./taskItemQueries.vue"
import ComponentTaskItemMssqls from "./taskItemMssqls.vue"

export default defineComponent({
    components: {
        ComponentTaskItemMetronom,
        ComponentTaskItemQueries,
        ComponentTaskItemMssqls
    },
    setup() {
        return {
            console,
            pagination: ref({
                rowsPerPage: 0
            }),
            state
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
