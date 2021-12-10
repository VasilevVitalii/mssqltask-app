<template>
    <div>
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
            :rows="state.mssqls"
            :columns="[
                {
                    name: 'instance',
                    label: 'instance',
                    field: 'instance',
                    sortable: true,
                    style: 'max-width: 30px',
                    headerStyle: 'max-width: 30px',
                    align: 'left'
                },
                { name: 'login', label: 'login', field: 'login', sortable: true, align: 'left' },
                { name: 'password', label: 'password', field: 'password', style: 'width: 30px', headerStyle: 'width: 30px', align: 'center' },
                { name: 'tags', label: 'tags', field: 'tags', align: 'left' },
                { name: 'state' }
            ]">
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="instance" :props="props" style="max-width: 200px">
                        <q-input dense v-model="props.row.edit.instance" borderless> </q-input>
                    </q-td>
                    <q-td key="login" :props="props">
                        <q-input dense v-model="props.row.edit.login" borderless> </q-input>
                    </q-td>
                    <q-td key="password" :props="props" style="width: 30px">
                        <q-btn
                            flat
                            dense
                            size="sm"
                            color="primary"
                            label="change"
                            style="margin: 2px 0px 0px 0px"
                            @click=";[(passwordText = ''), (passwordShow = true), (passwordIdx = props.row.idx)]" />
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

                        <!-- <q-chip
                            outline
                            color="primary"
                            v-for="(tag, idx) in props.row.edit.tags"
                            v-bind:key="idx"
                            removable
                            @remove="props.row.edit.tags = props.row.edit.tags.filter(f => f !== tag)">
                            {{ tag }}
                        </q-chip> -->
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

                            <q-btn flat dense size="sm" color="primary">clone</q-btn>
                            <q-separator vertical style="margin: 0px 5px 0px 5px"></q-separator>
                            <q-btn flat dense size="sm" color="primary">test connection</q-btn>
                        </div>
                    </q-td>
                </q-tr>
            </template>
        </q-table>

        <q-dialog v-model="passwordShow">
            <q-card>
                <q-card-section>
                    <div class="text-h6">
                        for instance <b> {{ state.mssqls[passwordIdx].edit.instance }} </b>
                    </div>
                </q-card-section>
                <q-card-section>
                    <q-input v-model="passwordText" square outlined type="password" label="new password" />
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="change" color="primary" v-close-popup @click="state.mssqls[passwordIdx].edit.password = passwordText" />
                    <q-btn flat label="cancel" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue"
import { state } from "@/state/edit"

export default defineComponent({
    setup() {
        return {
            pagination: ref({
                rowsPerPage: 0
            }),
            passwordIdx: ref(-1),
            passwordShow: ref(false),
            passwordText: ref(""),
            state
        }
    }
})
</script>
