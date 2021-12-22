<template>
    <q-btn-dropdown flat dense size="sm" color="primary" :label="queries.some(f => f.trim().length > 0) ? 'change' : 'set'" style="margin: 2px 5px 0px 0px">
        <div style="width: calc(100vw / 2); height: calc(100vh / 2); overflow-y: hidden; overflow-x: hidden">
            <q-toolbar style="height: 50px; margin: 0px 0px 10px 0px">
                <q-tabs v-model="currentQueryIdx" shrink stretch>
                    <q-tab v-for="(q, i) in queries" :key="i" :name="i">
                        <div style="display: float">
                            query #{{ i }}
                            <q-btn
                                style="margin: -2px 0px 0px 0px"
                                flat
                                dense
                                size="sm"
                                color="primary"
                                icon="close"
                                @click.stop=";[queries.splice(i, 1), (currentQueryIdx = 0)]" />
                        </div>
                    </q-tab>
                </q-tabs>
                <q-space />
                <q-btn flat label="add" @click=";[queries.push(''), (currentQueryIdx = queries.length - 1)]" />
            </q-toolbar>
            <textarea
                v-model="queries[currentQueryIdx]"
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
                " />
        </div>
    </q-btn-dropdown>
</template>
<script lang="ts">
import { PropType, defineComponent, ref } from "vue"
import { TTask } from "@/state/edit"

export default defineComponent({
    props: {
        item: {
            type: Object as PropType<TTask>,
            required: true
        }
    },
    setup(props) {
        let currentQueryIdx = ref(0)
        return {
            queries: props.item.item.state.queries,
            currentQueryIdx
        }
    }
})
</script>
<style lang="sass">
.metronom-list
    margin: 0px 20px 0px 20px
</style>
