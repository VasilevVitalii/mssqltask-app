<template>
    <q-btn
        style="margin: 2px 20px 0px 0px"
        flat
        dense
        size="sm"
        color="primary"
        :label="item.item.state.password ? 'change' : item.isNew ? 'set' : 'change'"
        @click="passwordChange()" />
</template>
<script lang="ts">
import { PropType, defineComponent } from "vue"
import { TMssql } from "@/state/edit"
import { promt } from "@/core/dialog"

export default defineComponent({
    props: {
        item: {
            type: Object as PropType<TMssql>,
            required: true
        }
    },
    setup(props) {
        const passwordChange = async () => {
            const item = props.item.item
            const password = await promt("text", "password for instance", `enter password for instance ${item.state.instance || "<UNKNOWN INSTANCE>"}`, "")
            if (password === undefined) return
            item.state.password = password
            return
        }

        return {
            passwordChange
        }
    }
})
</script>
