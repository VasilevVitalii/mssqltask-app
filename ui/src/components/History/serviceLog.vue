<template>
    <div>
        <ComponentBuzy v-show="state.buzy" />
        <div v-show="!state.buzy && state.files.length > 0" style="display: flex">
            <q-list padding style="overflow-y: scroll; height: calc(100vh - 50px - 50px - 30px - 10px); width: 270px">
                <q-item v-for="(item, idx) in state.files" :key="idx">
                    <q-item-section>
                        <q-item-label>
                            <div>{{ dFormat(item?.state?.dd) }}</div>
                        </q-item-label>
                        <q-item-label v-show="item.state.sizeError" caption>
                            <div>
                                <div class="div-info">error, size {{ sizeFormat(item.state.sizeError) }}</div>
                                <div class="div-command">
                                    <q-btn flat dense size="sm" color="primary" label="download" @click="download(item, 'error')" />
                                    <div v-show="item.state.sizeError <= 10000000">
                                        <q-btn
                                            v-show="!item.textError"
                                            flat
                                            dense
                                            size="sm"
                                            color="primary"
                                            label="show"
                                            @click="state.loadText(item, 'error')" />
                                    </div>
                                </div>
                            </div>
                        </q-item-label>
                        <q-item-label v-show="item.state.sizeDebug" caption>
                            <div>
                                <div class="div-info">debug, size {{ sizeFormat(item.state.sizeDebug) }}</div>
                                <div class="div-command">
                                    <q-btn flat dense size="sm" color="primary" label="download" @click="download(item, 'debug')" />
                                    <div v-show="item.state.sizeDebug <= 10000000">
                                        <q-btn
                                            v-show="!item.textDebug"
                                            flat
                                            dense
                                            size="sm"
                                            color="primary"
                                            label="show"
                                            @click="state.loadText(item, 'debug')" />
                                    </div>
                                </div>
                            </div>
                        </q-item-label>
                        <q-item-label v-show="item.state.sizeTrace" caption>
                            <div>
                                <div class="div-info">trace, size {{ sizeFormat(item.state.sizeTrace) }}</div>
                                <div class="div-command">
                                    <q-btn flat dense size="sm" color="primary" label="download" @click="download(item, 'trace')" />
                                    <div v-show="item.state.sizeTrace <= 10000000">
                                        <q-btn
                                            v-show="!item.textTrace"
                                            flat
                                            dense
                                            size="sm"
                                            color="primary"
                                            label="show"
                                            @click="state.loadText(item, 'trace')" />
                                    </div>
                                </div>
                            </div>
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
            <div v-show="state.text.item" style="width: calc(100% - 270px)">
                <textarea
                    v-model="state.text.text"
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
                    show {{ state.text.kind }} on date {{ dFormat(state.text.item?.state?.dd) }}, {{ state.text.text.split("\n").length }} line(s)
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import ComponentBuzy from "@/components/Buzy.vue"
import { defineComponent } from "vue"
import { state, TFile } from "@/state/serviceLog"
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

        const download = (item: TFile, kind: "error" | "debug" | "trace") => {
            state.download(item, kind, (blob, fileName) => {
                if (!blob || !fileName) return
                const link = document.createElement("a")
                link.href = window.URL.createObjectURL(blob)
                link.download = fileName
                link.click()
            })
        }

        return {
            state,
            dFormat,
            sizeFormat,
            download
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
