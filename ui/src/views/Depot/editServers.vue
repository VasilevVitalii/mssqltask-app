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
                :rows="list()"
                :columns="[
                    {name: 'title', label: 'title', field: 'item.state.title', sortable: true, style: 'width: 200px', align: 'left'},
                    {name: 'instance', label: 'instance', field: 'item.state.instance', sortable: true, style: 'width: 200px', align: 'left'},
                    {name: 'login', label: 'login', field: 'item.state.login', sortable: true, style: 'width: 100px', align: 'left'},
                    {name: 'password', label: 'password', field: 'item.state.password', style: 'width: 100px', align: 'left'},
                    {name: 'tags', label: 'tags', field: 'item.state.tags', align: 'left'},
                    {name: 'actions', align: 'left', style: 'width: 200px'},
                ]">
            <template v-slot:body="props">
                <q-tr :props="props" :class="props.row.isDel ? 'bg-negative-light' : props.row.isNew || props.row.item.getUpdProps().length > 0 ? 'bg-positive-light' : undefined">
                    <q-td key="title" :props="props">
                        <q-input borderless placeholder="title" v-model="props.row.item.state.title"/>
                    </q-td>
                    <q-td key="instance" :props="props">
                        <q-input borderless placeholder="instance" v-model="props.row.item.state.instance"/>
                    </q-td>
                    <q-td key="login" :props="props">
                        <q-input borderless placeholder="login" v-model="props.row.item.state.login"/>
                    </q-td>
                    <q-td key="password" :props="props">
                        <div style="display: flex">
                            <div style="width: 50px">
                                <q-btn dense flat color="accent" size="sm" :label="props.row.isNew && !props.row.item.state.password ? 'set' : 'change'" @click="onPassword(props.row)"/>
                            </div>
                            <q-btn dense flat size="sm"
                                :color="props.row.lastTestConnectionResult === true ? 'positive' : props.row.lastTestConnectionResult === false ? 'negative' : 'accent'"
                                :loading="props.row.buzyTestConnection"
                                :label="'test connection' + (props.row.lastTestConnectionResult === true ? '-ok' : props.row.lastTestConnectionResult === false ? '-fail' : '')"
                                style="margin: 0px 0px 0px 5px" @click="onTestConnection(props.row)"
                            >
                                <q-tooltip v-if="props.row.lastTestConnectionMessage">
                                    {{ props.row.lastTestConnectionMessage }}
                                </q-tooltip>
                            </q-btn>
                        </div>
                    </q-td>
                    <q-td key="tags" :props="props">
                        <div style="display: flex; flex-flow: wrap; justify-content: left">
                            <q-btn dense flat color="accent" size="sm" label="add" @click="props.row.item.state.tags.unshift('')"/>
                            <div v-for="(tag, tagIdx) in props.row.item.state.tags" :key="tagIdx" style="display: flex">
                                <q-chip outline removable color="primary" text-color="white" @remove="props.row.item.state.tags.splice(tagIdx, 1)">
                                    <q-input dense v-model="props.row.item.state.tags[tagIdx]" borderless :input-style="{width: widthTag(tag.length)}"/>
                                </q-chip>
                            </div>
                        </div>
                    </q-td>
                    <q-td key="actions" :props="props">
                        <q-btn dense flat color="accent" size="sm" label="clone" @click="onAdd(props.row)" v-show="!props.row.isDel"/>
                        <q-btn dense flat color="accent" size="sm" style="margin: 0px 0px 0px 5px" label="undo edit" @click="state.func.server.undoEdit(props.row)" v-show="!props.row.isNew && props.row.item.getUpdProps().length > 0"/>
                        <q-btn dense flat color="accent" size="sm" style="margin: 0px 0px 0px 5px" label="undo add" @click="state.func.server.undoAdd(props.row)" v-show="!props.row.isDel && props.row.isNew"/>
                        <q-btn dense flat color="accent" size="sm" style="margin: 0px 0px 0px 5px" label="undo delete" @click="state.func.server.undoDel(props.row)" v-show="props.row.isDel"/>
                        <q-btn dense flat color="accent" size="sm" style="margin: 0px 0px 0px 5px" label="delete" @click="state.func.server.del(props.row)" v-show="!props.row.isDel && !props.row.isNew"/>
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

        const list = () => {
            if (!state.data.serverFilter) return state.data.servers
            const sf = state.data.serverFilter.toLowerCase()
            return state.data.servers.filter(f =>
                (f.item.state.title && f.item.state.title.toLowerCase().indexOf(sf) >= 0) ||
                (f.item.state.instance && f.item.state.instance.toLowerCase().indexOf(sf) >= 0) ||
                (f.item.state.tags.some(ff => ff.indexOf(sf) >= 0))
            )
        }

        const onAdd = (source: TServer) => {
            state.func.server.add(source)
            env.dialogNotify('info', 'new server added to the end of the list')
        }

        const onPassword = (source: TServer) => {
            const password = env.dialogQuestion('password', 'Password', 'change password for server', '', result => {
                if (!result) return
                source.item.state.password = result
            })
        }

        const onTestConnection = (source: TServer) => {
            state.func.server.testConnection(source, hasResult => {
                if (!hasResult) return
                if (source.lastTestConnectionResult === true) {
                    env.dialogNotify('info', source.lastTestConnectionMessage || 'Test connection success')
                }
                if (source.lastTestConnectionResult === false) {
                    env.dialogNotify('warn', source.lastTestConnectionMessage || 'Test connection fail')
                }
            })
        }

        const widthTag = (tagLen: number): string => {
            if (!tagLen || tagLen < 5) {
                return '40px'
            }
            if (!tagLen || tagLen < 8) {
                return '60px'
            }
            if (tagLen <= 10) {
                return '90px'
            }
            if (tagLen <= 20) {
                return `${90 + 9 * (tagLen - 10)}px`
            }
            return `${90 + 8 * (tagLen - 10)}px`
        }

        return {
            state,
            env,
            pagination: ref({
                rowsPerPage: 0
            }),
            list,
            onAdd,
            onPassword,
            widthTag,
            onTestConnection
        }
    }
}
</script>
