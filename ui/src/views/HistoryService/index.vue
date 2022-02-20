<template>
    <ComponentBuzy v-show="state.data.buzy" />
    <div v-show="!state.data.buzy">
        <div style="display: flex">
            <div style="overflow-y: scroll; overflow-x: hidden; height: calc(100vh - 50px - 30px - 20px); width: 330px; margin: 10px 0px 10px 0px">
                <ComponentMenuLeft />
            </div>
            <div v-if="state.data.view" style="
                    display: grid;
                    place-items: flex-start;
                    width: calc(100% - 340px);
                    ">
                <q-btn flat color="accent" label="reload" style="margin: 10px 0px 0px 0px" @click="reload()" />
                <textarea
                    id="historyServiceText"
                    v-model="state.data.view.text"
                    spellcheck="false"
                    readonly
                    style="
                        margin: 0px 0px 10px 10px;
                        width: 100%;
                        height: calc(100vh - 50px - 30px - 20px - 30px);
                        resize: none;
                        overflow-y: scroll;
                        overflow-x: scroll;
                        border: none;
                        outline: none;
                        white-space: pre-wrap;
                    " />
            </div>
        </div>
        <ComponentStatus v-show="state.data.items.length > 0" class="fixed-bottom"/>
    </div>
</template>
<script lang="ts">
import ComponentBuzy from '@/components/Buzy.vue'
import ComponentMenuLeft from './menuLeft.vue'
import ComponentStatus from './status.vue'
import state from './state'

export default {
    components: {
        ComponentBuzy,
        ComponentMenuLeft,
        ComponentStatus
    },
    setup() {
        if (state.data.countLoad === 0) {
            state.func.load()
        }

        const reload = () => {
            if (!state.data.view) return
            state.func.view(state.data.view.type, state.data.view.item, () => {
                const historyServiceText = document.querySelector("#historyServiceText")
                if (historyServiceText) {
                    historyServiceText.scrollTop = historyServiceText.scrollHeight
                }
            })
        }

        return {
            state,
            reload
        }
    }
}
</script>