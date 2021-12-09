<template>
    <ComponentBuzy v-show="state.loading"></ComponentBuzy>
    <!-- <div v-show="state.loading" style="text-align: center; margin: 10px 0px 0px 0px">
        <q-circular-progress indeterminate size="100px" color="primary" class="q-ma-md" />
    </div> -->
    <div v-show="!state.loading">
        <q-toolbar>
            <q-btn flat @click="state.load()">reload</q-btn>
            <q-btn flat>save</q-btn>
            <q-btn flat>group change</q-btn>
            <q-space />
            <q-btn-dropdown flat color="primary" :label="'show ' + pointEdit + ' list'">
                <q-list>
                    <q-item clickable v-close-popup @click="pointEdit = 'mssql'">
                        <q-item-section>
                            <q-item-label>mssql</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-close-popup @click="pointEdit = 'task'">
                        <q-item-section>
                            <q-item-label>task</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-btn-dropdown>
        </q-toolbar>
        <ComponentMssqlList v-show="pointEdit === 'mssql'"></ComponentMssqlList>
    </div>
</template>
<script lang="ts">
import { ref } from "vue"
import ComponentBuzy from "@/components/Buzy.vue"
import ComponentMssqlList from "./mssqlList.vue"
import { state } from "@/state/edit"

export default {
    components: {
        ComponentBuzy,
        ComponentMssqlList
    },
    setup() {
        let pointEdit = ref("mssql")

        return {
            state,
            pointEdit
        }
    }
}
</script>
