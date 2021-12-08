<template>
    <ComponentBuzy v-show="stateEdit.loading"></ComponentBuzy>
    <!-- <div v-show="stateEdit.loading" style="text-align: center; margin: 10px 0px 0px 0px">
        <q-circular-progress indeterminate size="100px" color="primary" class="q-ma-md" />
    </div> -->
    <div v-show="!stateEdit.loading">
        <q-btn-dropdown flat color="primary" :label="Edit {{ whatEdit }} list">
            <q-list>
                <q-item clickable v-close-popup @click="onItemClick">
                    <q-item-section>
                        <q-item-label>Photos</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="onItemClick">
                    <q-item-section>
                        <q-item-label>Videos</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="onItemClick">
                    <q-item-section>
                        <q-item-label>Articles</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-btn-dropdown>
    </div>
</template>
<script lang="ts">
import ref from "vue"
import ComponentBuzy from "@/components/Buzy.vue"

import { stateEdit } from "@/store/edit"
export default {
    components: {
        ComponentBuzy
    },
    setup() {
        let whatEdit = ref("mssql") as "mssql" | "task"

        return {
            stateEdit,
            whatEdit
        }
    }
}
</script>
