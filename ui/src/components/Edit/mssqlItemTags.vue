<template>
    <div style="display: flex; flex-flow: wrap">
        <q-btn flat dense size="sm" color="primary" icon="add" @click="item.state.tags.push('')" style="margin: 2px 20px 0px 0px" />
        <div v-for="(tag, idx) in item.state.tags" :key="idx" style="display: flex; margin: 0px 20px 0px 0px">
            <q-input dense v-model="item.state.tags[idx]" borderless :style="{ width: (2 + (item.state.tags[idx].length === 0 ? 9 : item.state.tags[idx].length) / 1.8).toString() + 'em' }" placeholder="enter tag">
                <template v-slot:before>
                    <q-btn style="margin: 2px -5px 0px 0px" flat dense size="sm" color="primary" icon="close" @click="item.state.tags.splice(idx, 1)" />
                </template>
            </q-input>
        </div>
    </div>
</template>
<script lang="ts">
import { PropType, defineComponent } from "vue"
import { TMssql } from "@/state/edit"

export default defineComponent({
    props: {
        item: {
            type: Object as PropType<TMssql>,
            required: true
        }
    },
    setup(props) {
        return {
            item: props.item.item
        }
    }
})
</script>
