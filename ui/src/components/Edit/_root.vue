<template>
    <ComponentBuzy v-show="state.buzy"></ComponentBuzy>
    <div v-show="!state.buzy">
        <q-toolbar>
            <q-btn flat @click="state.load()">reload</q-btn>
            <q-btn flat @click="saveItems()">save</q-btn>
            <q-btn flat @click="addItem(pointEdit)">add</q-btn>
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

        const saveItems = async () => {
            await state.delete()
            await state.load()
        }

        const addItem = (pointEdit: string) => {
            if (pointEdit === "mssql") {
                const newItem = state.newMssql()
                newItem.edit.instance = "enter instance"
                newItem.edit.login = "enter login"
                state.mssqls.push(newItem)
            } else if (pointEdit === "task") {
                console.log("еще не сделано")
            }
        }

        return {
            state,
            pointEdit,
            addItem,
            saveItems
        }
    }
}
</script>
