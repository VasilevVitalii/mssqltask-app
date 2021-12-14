<template>
    <ComponentBuzy v-show="state.buzy"></ComponentBuzy>
    <div v-show="!state.buzy">
        <q-toolbar style="height: 50px">
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
        <ComponentTaskList v-show="pointEdit === 'task'"></ComponentTaskList>
        <div class="text-white bg-primary fixed-bottom" style="height: 30px; width: 100%; display: flex">
            <div style="align-self: center; margin: 0px 5px 0px 5px" class="noactive">
                mssqls (total / added / updated / deleted): {{ state.mssqls.length }} / {{ state.mssqls.filter(f => f.new()).length }} /
                {{ state.mssqls.filter(f => f.upd()).length }} / {{ state.mssqls.filter(f => f.del).length }}
            </div>
            <q-separator class="noactive" color="white" vertical style="margin: 5px"></q-separator>
            <div style="align-self: center; margin: 0px 5px 0px 5px" class="noactive">
                tasks (total / added / updated / deleted): {{ state.tasks.length }} / {{ state.tasks.filter(f => f.new()).length }} /
                {{ state.tasks.filter(f => f.upd()).length }} / {{ state.tasks.filter(f => f.del).length }}
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { ref } from "vue"
import ComponentBuzy from "@/components/Buzy.vue"
import ComponentMssqlList from "./mssqlList.vue"
import ComponentTaskList from "./taskList.vue"
import { state } from "@/state/edit"

export default {
    components: {
        ComponentBuzy,
        ComponentMssqlList,
        ComponentTaskList
    },
    setup() {
        let pointEdit = ref("mssql")

        const saveItems = async () => {
            state.delete(success => {
                if (!success) return
                state.change(success => {
                    if (!success) return
                    state.load()
                })
            })
        }

        const addItem = (pointEdit: string) => {
            if (pointEdit === "mssql") {
                const newItem = state.newMssql()
                state.mssqls.push(newItem)
            } else if (pointEdit === "task") {
                const newItem = state.newTask()
                state.tasks.push(newItem)
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
<style lang="sass" scoped>
.noactive
    opacity: 0.8
</style>
