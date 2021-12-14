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
                    name: 'title',
                    label: 'title',
                    field: 'title',
                    sortable: true,
                    style: 'width: 200px',
                    align: 'left'
                },
                {
                    name: 'instance',
                    label: 'instance',
                    field: 'instance',
                    sortable: true,
                    style: 'width: 200px',
                    align: 'left'
                },
                { name: 'login', label: 'login', field: 'login', sortable: true, align: 'left', style: 'width: 100px' },
                { name: 'password', label: 'password', field: 'password', style: 'width: 50px', align: 'center' },
                { name: 'tags', label: 'tags', field: 'tags', align: 'left' },
                { name: 'state', style: 'width: 350px' }
            ]">
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="title" :props="props">
                        <q-input dense v-model="props.row.edit.title" borderless placeholder="enter title"> </q-input>
                    </q-td>
                    <q-td key="instance" :props="props">
                        <q-input dense v-model="props.row.edit.instance" borderless placeholder="enter instance"> </q-input>
                    </q-td>
                    <q-td key="login" :props="props">
                        <q-input dense v-model="props.row.edit.login" borderless placeholder="enter login"> </q-input>
                    </q-td>
                    <q-td key="password" :props="props">
                        <q-btn
                            flat
                            dense
                            size="sm"
                            color="primary"
                            :label="props.row.edit.password ? 'change' : props.row.new() ? 'set' : 'change'"
                            style="margin: 2px 0px 0px 0px"
                            @click="passwordChange(props.row.idx)" />
                    </q-td>
                    <q-td key="tags" :props="props">
                        <div style="display: flex; flex-flow: wrap">
                            <q-btn
                                flat
                                dense
                                size="sm"
                                color="primary"
                                icon="add"
                                @click="props.row.edit.tags.push('new tag')"
                                style="margin: 2px 20px 0px 0px" />
                            <div v-for="(tag, idx) in props.row.edit.tags" :key="idx" style="display: flex; margin: 0px 20px 0px 0px">
                                <q-input
                                    dense
                                    v-model="props.row.edit.tags[idx]"
                                    borderless
                                    :style="{ width: (2 + props.row.edit.tags[idx].length / 1.8).toString() + 'em' }">
                                    <template v-slot:before>
                                        <q-btn
                                            style="margin: 2px -5px 0px 0px"
                                            flat
                                            dense
                                            size="sm"
                                            color="primary"
                                            icon="close"
                                            @click="props.row.edit.tags.splice(idx, 1)" />
                                    </template>
                                </q-input>
                            </div>
                        </div>
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
                            <q-separator vertical style="margin: 0px 5px 0px 5px"></q-separator>
                            <q-btn flat dense size="sm" color="primary" @click="testConnection(props.row.idx)">test connection</q-btn>
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
import { send } from "@/core/rest"
import { TReplyConnection } from "../../../../src/api"
import { notify, promt } from "@/core/dialog"

export default defineComponent({
    setup() {
        const cloneItem = (idx: number) => {
            const parentItem = state.mssqls[idx]
            const cloneItem = state.newMssql()
            cloneItem.edit = JSON.parse(JSON.stringify(parentItem.edit))
            cloneItem.edit.instance = `${cloneItem.edit.instance} - clone`
            cloneItem.edit.title = `${cloneItem.edit.title} - clone`
            cloneItem.edit.path = ""
            cloneItem.edit.file = ""
            state.mssqls.push(cloneItem)
        }

        const passwordChange = async (idx: number): Promise<boolean> => {
            const mssql = state.mssqls[idx].edit
            const password = await promt("text", "password for instance", `enter password for instance ${mssql.instance}`, "")
            if (password === undefined) return false
            mssql.password = password
            return true
        }

        const testConnection = async (idx: number) => {
            const mssql = state.mssqls[idx]
            if (mssql.new() && !mssql.edit.password) {
                const isPass = await passwordChange(idx)
                if (!isPass) return
            }
            send({ kind: "test-connection", token: "", data: { mssqls: [mssql.edit] } }, result => {
                const r = result as TReplyConnection
                if (r && r.data && r.data.mssqls && r.data.mssqls.length === 1 && r.data.errors.length === 1 && r.data.infos.length === 1) {
                    const instance = r.data.mssqls[0].instance
                    const error = r.data.errors[0]
                    const info = r.data.infos[0]
                    if (error) {
                        notify("error", `Error test connection ${instance}: ${error}`)
                    } else {
                        notify(
                            "info",
                            `Success test connection ${instance}: duration(msec): ${info.duration}, timezone (min regarding Greenwich) = ${info.timezone}, versuin = ${info.version}`
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
            passwordChange,
            testConnection,
            cloneItem
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
