<template>
    <div>
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
            :rows="state.mssqls"
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
                    name: 'title',
                    label: 'title',
                    field: 'title',
                    sortable: true,
                    style: 'width: 200px',
                    align: 'left'
                },
                { name: 'login', label: 'login', field: 'login', sortable: true, align: 'left', style: 'width: 100px' },
                { name: 'password', label: 'password', field: 'password', style: 'width: 50px', align: 'center' },
                { name: 'tags', label: 'tags', field: 'tags', align: 'left' },
                { name: 'commands', style: 'width: 350px' }
            ]">
            <template v-slot:body="props">
                <q-tr :props="props" :class="!props.row.isDel && (props.row.isNew || props.row.item.getUpdProps().length > 0) ? 'bg-info' : props.row.isDel ? 'bg-warning' : ''">
                    <q-td key="instance" :props="props">
                        <q-input dense v-model="props.row.item.state.instance" borderless placeholder="enter instance"> </q-input>
                    </q-td>
                    <q-td key="title" :props="props">
                        <q-input dense v-model="props.row.item.state.title" borderless placeholder="enter title"> </q-input>
                    </q-td>
                    <q-td key="login" :props="props">
                        <q-input dense v-model="props.row.item.state.login" borderless placeholder="enter login"> </q-input>
                    </q-td>
                    <q-td key="password" :props="props">
                        <ComponentMssqlItemPassword :item="props.row" />
                    </q-td>
                    <q-td key="tags" :props="props">
                        <ComponentMssqlItemTags :item="props.row" />
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
                                    @click="state.mssqls = state.mssqls.filter(f => f.idx !== props.row.idx)"
                                    label="undo add" />
                                <q-separator vertical style="margin: 0px 5px 0px 5px"></q-separator>
                            </div>
                            <div v-show="!props.row.isNew" style="display: flex">
                                <q-btn flat dense size="sm" color="primary" v-show="props.row.isDel" @click="props.row.isDel = false" label="undo delete" />
                                <q-btn flat dense size="sm" color="primary" v-show="!props.row.isDel" @click="props.row.isDel = true" label="delete" />
                                <q-separator vertical style="margin: 0px 5px 0px 5px"></q-separator>
                            </div>
                            <q-btn flat dense size="sm" color="primary" @click="state.addMssql(props.row)" label="clone" />
                            <q-separator vertical style="margin: 0px 5px 0px 5px"></q-separator>
                            <q-btn
                                flat
                                dense
                                size="sm"
                                color="primary"
                                :loading="props.row.buzyTestConnection"
                                @click="testConnection(props.row)"
                                :label="
                                    'test connection' +
                                    (props.row.lastTestConnectionSuccess === undefined
                                        ? ''
                                        : props.row.lastTestConnectionSuccess === true
                                        ? ' - ok'
                                        : ' - fail')
                                " />
                        </div>
                    </q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue"
import { state, TMssql } from "@/state/edit"
import { send } from "@/core/rest"
import { TReplyConnection } from "../../../../src/api"
import { notify } from "@/core/dialog"

import ComponentMssqlItemPassword from "./mssqlItemPassword.vue"
import ComponentMssqlItemTags from "./mssqlItemTags.vue"

export default defineComponent({
    components: {
        ComponentMssqlItemPassword,
        ComponentMssqlItemTags
    },
    setup() {
        const testConnection = async (mssql: TMssql) => {
            if (mssql.buzyTestConnection) return
            mssql.buzyTestConnection = true
            send({ kind: "test-connection", token: "", data: { mssqls: [mssql.item.state] } }, result => {
                const r = result as TReplyConnection
                if (r && r.data && r.data.mssqls && r.data.mssqls.length === 1 && r.data.errors.length === 1 && r.data.infos.length === 1) {
                    const instance = r.data.mssqls[0].instance
                    const error = r.data.errors[0]
                    const info = r.data.infos[0]
                    mssql.buzyTestConnection = false
                    if (error) {
                        mssql.lastTestConnectionSuccess = false
                        notify("error", `Error test connection ${instance}: ${error}`)
                    } else {
                        mssql.lastTestConnectionSuccess = true
                        notify(
                            "info",
                            `Success test connection ${instance}: duration(msec): ${info.duration}, timezone (min regarding Greenwich) = ${info.timezone}, version = ${info.version}`
                        )
                    }
                }
            })
        }

        return {
            pagination: ref({
                rowsPerPage: 0
            }),
            state,
            testConnection
        }
    }
})
</script>
<style lang="sass">
.my-table-mssql
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
