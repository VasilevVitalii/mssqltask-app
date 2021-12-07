<template>
    <div v-show="stateEdit.loading" style="text-align: center; margin: 10px 0px 0px 0px">
        <q-circular-progress indeterminate size="100px" color="primary" class="q-ma-md" />
    </div>
    <div v-show="!stateEdit.loading">
        <h3>load!</h3>
    </div>
</template>
<script lang="ts">
//import { workflow } from "@/transport/router"
import { stateEdit } from "@/store/edit"
export default {
    setup() {
        return { stateEdit }
    }
}
</script>
