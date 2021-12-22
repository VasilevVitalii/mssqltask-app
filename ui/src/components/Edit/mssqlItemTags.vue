<template>
    <div style="display: flex; flex-flow: wrap">
        <q-btn flat dense size="sm" color="primary" icon="add" @click="tags.push('new tag')" style="margin: 2px 20px 0px 0px" />
        <div v-for="(tag, idx) in tags" :key="idx" style="display: flex; margin: 0px 20px 0px 0px">
            <q-input dense v-model="tags[idx]" borderless :style="{ width: (2 + tags[idx].length / 1.8).toString() + 'em' }">
                <template v-slot:before>
                    <q-btn style="margin: 2px -5px 0px 0px" flat dense size="sm" color="primary" icon="close" @click="tags.splice(idx, 1)" />
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
            tags: props.item.item.state.tags
        }
    }
})
</script>
