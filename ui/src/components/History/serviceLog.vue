<template>
    <div>
        <ComponentBuzy v-show="state.buzy" />
        <div v-show="!state.buzy && state.days.length > 0" style="display: flex">
            <q-list padding style="overflow-y: scroll; height: calc(100vh - 50px - 50px - 30px - 10px); width: 270px">
                <q-item v-for="(item, idx) in state.days" :key="idx">
                    <q-item-section>
                        <q-item-label>
                            <div>{{ dFormat(item?.dd) }}</div>
                        </q-item-label>
                        <ComponentServiceItem :item="item" :kind="'error'" />
                        <ComponentServiceItem :item="item" :kind="'debug'" />
                        <ComponentServiceItem :item="item" :kind="'trace'" />
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
import ComponentServiceItem from "./serviceItem.vue"

import { defineComponent } from "vue"
import { state } from "@/state/serviceLog"
import { dateFormat, toDate } from "vv-common"

export default defineComponent({
    components: {
        ComponentBuzy,
        ComponentServiceItem
    },
    setup() {
        const dFormat = (d: string): string => {
            return dateFormat(toDate(d) || new Date(2000, 1, 1), "yyyy.mm.dd")
        }

        return {
            state,
            dFormat
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
