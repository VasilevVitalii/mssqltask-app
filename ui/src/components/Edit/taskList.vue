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
                                        <q-checkbox v-model="props.row.edit.metronom.weekdaySun" label="sunday" />
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
                        <q-btn-dropdown
                            @focus="currentQueryIdx = props.row.edit.queries.length > 0 ? 0 : -1"
                            flat
                            dense
                            size="sm"
                            color="primary"
                            :label="props.row.edit.queries.some(f => f.trim().length > 0) ? 'change' : 'set'"
                            style="margin: 2px 5px 0px 0px">
                            <div style="width: calc(100vw / 2); height: calc(100vh / 2); overflow-y: hidden; overflow-x: hidden">
                                <q-toolbar style="height: 50px; margin: 0px 0px 10px 0px">
                                    <q-tabs v-model="currentQueryIdx" shrink stretch>
                                        <q-tab v-for="(q, i) in props.row.edit.queries" :key="i" :name="i">
                                            <div style="display: float">
                                                query #{{ i }}
                                                <q-btn
                                                    style="margin: -2px 0px 0px 0px"
                                                    flat
                                                    dense
                                                    size="sm"
                                                    color="primary"
                                                    icon="close"
                                                    @click.stop="props.row.edit.queries = onDeleteQuery(props.row.edit.queries, i)" />
                                            </div>
                                        </q-tab>
                                    </q-tabs>
                                    <q-space />
                                    <q-btn
                                        flat
                                        label="add"
                                        @click=";[props.row.edit.queries.push(''), (currentQueryIdx = props.row.edit.queries.length - 1)]" />
                                </q-toolbar>
                                <textarea
                                    v-model="props.row.edit.queries[currentQueryIdx]"
                                    spellcheck="false"
                                    style="
                                        width: 100%;
                                        height: calc(100% - 60px);
                                        resize: none;
                                        overflow-y: scroll;
                                        overflow-x: scroll;
                                        border: none;
                                        outline: none;
                                        white-space: nowrap;
                                    "></textarea>
                            </div>
                        </q-btn-dropdown>
                    </q-td>
                    <q-td key="mssqls" :props="props">
                        <q-btn-dropdown
                            @focus="freeMssqlBuild(props.row.edit.mssqls.tags, props.row.edit.mssqls.instances)"
                            flat
                            dense
                            size="sm"
                            color="primary"
                            :label="'link (' + props.row.mates().length + ')'"
                            style="margin: 2px 0px 0px 0px">
                            <div style="width: calc(100vw / 2); height: calc(100vh / 2); overflow-y: hidden; overflow-x: hidden; margin: 10px">
                                <q-chip clickable> Add tag or instance </q-chip>
                                <q-select
                                    @focus="console.log('focus')"
                                    filled
                                    v-model="model"
                                    use-input
                                    input-debounce="0"
                                    :options="freeMssql"
                                    @filter="freeMssqlFilter"
                                    style="width: 250px" />
                                TAGS
                                <div v-for="(tag, tagIdx) in props.row.edit.mssqls.tags" :key="tagIdx">
                                    <q-chip>
                                        {{ tag }}
                                    </q-chip>
                                </div>
                                <div v-for="(instance, instanceIdx) in props.row.edit.mssqls.instances" :key="instanceIdx">
                                    <q-chip>
                                        {{ instance }}
                                    </q-chip>
                                </div>
                            </div>
                        </q-btn-dropdown>
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
import * as vv from "vv-common"

export default defineComponent({
    setup() {
        const cloneItem = (idx: number) => {
            const parentItem = state.tasks[idx]
            const cloneItem = state.newTask()
            cloneItem.edit = JSON.parse(JSON.stringify(parentItem.edit))
            cloneItem.edit.title = `${cloneItem.edit.title} - clone`
            cloneItem.edit.path = ""
            cloneItem.edit.file = ""
            state.tasks.push(cloneItem)
        }

        let currentQueryIdx = ref(0)

        const onDeleteQuery = (queries: string[], queryIdx: number): string[] => {
            currentQueryIdx.value = 0
            return queries.slice(0, queryIdx).concat(queries.slice(queryIdx + 1, queries.length))
        }

        const freeMssql: { label: string; value: string }[] = []

        const freeMssqlBuild = (existsTag: string[], existsInstances: string[]): { label: string; value: string }[] => {
            const result: { label: string; value: string }[] = []
            state.mssqls.forEach(mssql => {
                mssql.edit.tags.forEach(item => {
                    if (!existsTag.some(f => vv.equal(f, item)) && !result.some(f => vv.equal(f.value, `t-${item}`))) {
                        result.push({ value: `t-${item}`, label: item })
                    }
                })
            })
            state.mssqls.forEach(mssql => {
                if (!existsInstances.some(f => vv.equal(f, mssql.edit.instance)) && !result.some(f => vv.equal(f.value, `i-${mssql.edit.instance}`))) {
                    result.push({ value: `i-${mssql.edit.instance}`, label: mssql.edit.title || mssql.edit.instance })
                }
            })
            return result
        }

        let freeMssqlFilterText = ref("")

        const freeMssqlFilter = (val: any, update: any) => {
            update(() => {
                freeMssqlFilterText = val
            })

            // console.log(FreeMssql([], []))
            // console.log(val)
            // console.log(update)

            // if (val === "") {
            //     update(() => {
            //         FreeMssqlFilterText
            //         options.value = stringOptions

            //         // here you have access to "ref" which
            //         // is the Vue reference of the QSelect
            //     })
            //     return
            // }

            // update(() => {
            //     const needle = val.toLowerCase()
            //     options.value = stringOptions.filter(v => v.toLowerCase().indexOf(needle) > -1)
            // })
        }

        return {
            console,
            pagination: ref({
                rowsPerPage: 0
            }),
            currentQueryIdx,
            state,
            cloneItem,
            editMetronomTask: undefined as TypeMetronom | undefined,
            onDeleteQuery,
            freeMssql,
            freeMssqlBuild,
            freeMssqlFilter,
            freeMssqlFilterText
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
.metronom-list
    margin: 0px 20px 0px 20px
</style>
