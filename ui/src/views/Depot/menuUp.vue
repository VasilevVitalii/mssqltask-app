<template>
    <q-toolbar style="height: 50px">
        <q-btn dense color="accent" flat label="save tasks and servers"/>
        <q-separator style="margin: 10px 10px 10px 10px" vertical color="primary" />
        <div style="width: 150px">
            <q-btn-dropdown dense color="accent" flat :label="'edit ' + state.data.viewBy + 's'">
                <q-list>
                    <q-item clickable v-close-popup @click="state.data.viewBy = 'task'">
                    <q-item-section>
                        <q-item-label>TASKS</q-item-label>
                    </q-item-section>
                    </q-item>

                    <q-item clickable v-close-popup @click="state.data.viewBy = 'server'">
                    <q-item-section>
                        <q-item-label>SERVERS</q-item-label>
                    </q-item-section>
                    </q-item>
                </q-list>
            </q-btn-dropdown>
        </div>
        <div style="width: 110px">
            <q-btn color="accent" dense flat :label="'add ' + state.data.viewBy" @click="onAdd()"/>
        </div>
        <div>
            <q-btn color="accent" dense flat :label="'undo all changes in ' + state.data.viewBy + 's'" @click="onUndo()"/>
        </div>
    </q-toolbar>
</template>
<script lang="ts">
import { state } from './state'
import * as env from '@/core/_env'

export default {

    setup() {
        const onAdd = () => {
            if (state.data.viewBy === 'server') {
                state.func.server.add()
                env.dialogNotify('info', 'new server added to the end of the list')
            }
            if (state.data.viewBy === 'task') {
                state.func.task.add()
                env.dialogNotify('info', 'new task added to the end of the list')
            }
        }

        const onUndo = () => {
            if (state.data.viewBy === 'server') {
                state.data.servers.filter(f => f.isNew).forEach(s => state.func.server.undoAdd(s))
                state.data.servers.filter(f => f.isDel).forEach(s => state.func.server.undoDel(s))
                state.data.servers.filter(f => f.item.getUpdProps().length > 0).forEach(s => state.func.server.undoEdit(s))
                env.dialogNotify('info', 'all server changes are cancelled')
            }
            if (state.data.viewBy === 'task') {
                state.data.tasks.filter(f => f.isNew).forEach(s => state.func.task.undoAdd(s))
                state.data.tasks.filter(f => f.isDel).forEach(s => state.func.task.undoDel(s))
                state.data.tasks.filter(f => f.item.getUpdProps().length > 0).forEach(s => state.func.task.undoEdit(s))
                env.dialogNotify('info', 'all task changes are cancelled')
            }
        }

        return {
            state,
            env,
            onAdd,
            onUndo
        }
    }
}
</script>
<style lang="sass">
.noactive
    opacity: 0.7
</style>