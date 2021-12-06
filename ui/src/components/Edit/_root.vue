<template>
    <div v-show="state.loading" style="text-align: center; margin: 10px 0px 0px 0px">
        <q-circular-progress indeterminate size="100px" color="primary" class="q-ma-md" />
    </div>
    <div v-show="!state.loading && state.loadErrorText">
        <q-banner inline-actions class="text-white bg-negative">
            Load data error: {{ state.loadErrorText }}
            <template v-slot:action>
                <q-btn flat label="reload" @click="state.load()" />
            </template>
        </q-banner>
    </div>
</template>
<script lang="ts">
import { workflow } from "@/router"
import { state } from "@/store/edit"
export default {
    setup() {
        return { workflow: workflow, state: state }
    }
}
</script>
