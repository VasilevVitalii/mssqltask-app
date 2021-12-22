<template>
    <div>
        <ComponentBuzy v-show="state.buzy" />
        <div v-show="!state.buzy && state.files.length > 0" style="display: flex">
            <q-list padding style="overflow-y: scroll; height: calc(100vh - 50px - 50px - 30px - 10px); width: 270px">
                <q-item v-for="(item, idx) in state.files" :key="idx" :disable="item.bizy">
                    <q-item-section>
                        <q-item-label>
                            <div style="display: flex; align-items: center">
                                <div>{{ dFormat(item?.state?.dd) }}</div>
                                <q-btn
                                    v-show="item.allowReload"
                                    flat
                                    dense
                                    size="sm"
                                    color="primary"
                                    label="reload this day"
                                    style="margin: 0px 0px 0px 10px"
                                    @click="state.reload(item)" />
                            </div>
                        </q-item-label>
                        <q-item-label v-show="item.state.sizeError" caption>
                            <div>
                                <div class="div-info">error, size {{ sizeFormat(item.state.sizeError) }}</div>
                                <div class="div-command">
                                    <q-btn flat dense size="sm" color="primary" label="download" />
                                    <div v-show="item.state.sizeError <= 10000000">
                                        <q-btn
                                            v-show="!item.textError"
                                            flat
                                            dense
                                            size="sm"
                                            color="primary"
                                            label="load"
                                            @click="state.loadText(item, 'error')" />
                                        <q-btn
                                            v-show="item.textError"
                                            flat
                                            dense
                                            size="sm"
                                            color="primary"
                                            label="show"
                                            @click=";[(state.text.item = item), (state.text.kind = 'error')]" />
                                    </div>
                                </div>
                            </div>
                        </q-item-label>
                        <q-item-label v-show="item.state.sizeDebug" caption>
                            <div>
                                <div class="div-info">debug, size {{ sizeFormat(item.state.sizeDebug) }}</div>
                                <div class="div-command">
                                    <q-btn flat dense size="sm" color="primary" label="download" />
                                    <div v-show="item.state.sizeDebug <= 10000000">
                                        <q-btn
                                            v-show="!item.textDebug"
                                            flat
                                            dense
                                            size="sm"
                                            color="primary"
                                            label="load"
                                            @click="state.loadText(item, 'debug')" />
                                        <q-btn
                                            v-show="item.textDebug"
                                            flat
                                            dense
                                            size="sm"
                                            color="primary"
                                            label="show"
                                            @click=";[(state.text.item = item), (state.text.kind = 'debug')]" />
                                    </div>
                                </div>
                            </div>
                        </q-item-label>
                        <q-item-label v-show="item.state.sizeTrace" caption>
                            <div>
                                <div class="div-info">trace, size {{ sizeFormat(item.state.sizeTrace) }}</div>
                                <div class="div-command">
                                    <q-btn flat dense size="sm" color="primary" label="download" />
                                    <div v-show="item.state.sizeTrace <= 10000000">
                                        <q-btn
                                            v-show="!item.textTrace"
                                            flat
                                            dense
                                            size="sm"
                                            color="primary"
                                            label="load"
                                            @click="state.loadText(item, 'trace')" />
                                        <q-btn
                                            v-show="item.textTrace"
                                            flat
                                            dense
                                            size="sm"
                                            color="primary"
                                            label="show"
                                            @click=";[(state.text.item = item), (state.text.kind = 'trace')]" />
                                    </div>
                                </div>
                            </div>
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
            <div v-show="state.text.item" style="width: calc(100% - 270px)">
                <textarea
                    v-bind:value="showText()"
                    spellcheck="false"
                    readonly
                    style="
                        width: 100%;
                        height: calc(100vh - 50px - 50px - 30px - 10px);
                        resize: none;
                        overflow-y: scroll;
                        overflow-x: scroll;
                        border: none;
                        outline: none;
                        white-space: pre-wrap;
                    " />
            </div>
            <div class="text-white bg-primary fixed-bottom" style="height: 30px; width: 100%; display: flex">
                <div style="align-self: center; margin: 0px 5px 0px 5px" class="noactive" v-show="state.text.item">
                    show {{ state.text.kind }} on date {{ dFormat(state.text.item?.state?.dd) }}
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import ComponentBuzy from "@/components/Buzy.vue"
import { defineComponent } from "vue"
import { state } from "@/state/serviceLog"
import { dateFormat, toDate } from "vv-common"

export default defineComponent({
    components: {
        ComponentBuzy
    },
    setup() {
        const sizeFormat = (size: number): string => {
            if (!size) return ""
            const sizeMb = Math.round(size / 1000 / 1000)
            if (sizeMb <= 0) return "<1 Mb"
            return `${sizeMb} Mb`
        }

        const dFormat = (d: string): string => {
            return dateFormat(toDate(d) || new Date(2000, 1, 1), "yyyy.mm.dd")
        }

        const showText = () => {
            if (!state.text.item) return ""
            if (state.text.kind === "error") {
                return state.text.item.textError
            } else if (state.text.kind === "debug") {
                return state.text.item.textDebug
            } else if (state.text.kind === "trace") {
                return state.text.item.textTrace
            } else {
                return ""
            }
        }

        return {
            state,
            dFormat,
            sizeFormat,
            showText
        }
    }
})
</script>
<style lang="sass">
.div-info
    float: left
.div-command
    display: flex
    float: right
    margin: -4px 0px 0px 0px
.noactive
    opacity: 0.8
</style>
