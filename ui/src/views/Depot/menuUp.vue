<template>
    <q-toolbar style="height: 50px">
        <q-btn dense color="accent" flat :label="state.data.countLoad > 0 ? 'reload' : 'load'" @click="onLoad()"/>
        <q-separator style="margin: 10px 10px 10px 10px" vertical color="primary" />
        <q-btn dense color="accent" flat label="save tasks and servers" @click="onSave()"/>
        <q-separator style="margin: 10px 10px 10px 10px" vertical color="primary" />
        <div style="width: 150px">
            <q-btn-dropdown dense color="accent" flat :label="'view ' + state.data.viewBy + 's'">
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
        <q-separator style="margin: 10px 10px 10px 10px" vertical color="primary" />
        <q-input borderless v-model="state.data.taskFilter" v-show="state.data.viewBy === 'task'" placeholder="filter by title and key" input-style="min-width: 200px">
            <template v-slot:prepend>
                <q-icon v-if="state.data.taskFilter === ''" name="search" />
                <q-icon v-else name="clear" class="cursor-pointer" @click="state.data.taskFilter = ''" />
            </template>
        </q-input>
        <q-input borderless v-model="state.data.serverFilter" v-show="state.data.viewBy === 'server'" placeholder="filter by title, instance and tags" input-style="min-width: 200px">
            <template v-slot:prepend>
                <q-icon v-if="state.data.serverFilter === ''" name="search" />
                <q-icon v-else name="clear" class="cursor-pointer" @click="state.data.serverFilter = ''" />
            </template>
        </q-input>

    </q-toolbar>
</template>
<script lang="ts">
import { state } from './state'
import * as env from '@/core/_env'

export default {

    setup() {

        const onLoad = () => {
            if (state.func.hasChanges()) {
                env.dialogQuestion('Load tasks and servers', 'Task or servers has changed that will be lost after reload. Continue?', result => {
                    if (!result) return
                    state.func.load()
                })
            } else {
                state.func.load()
            }
        }

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

        const onSave = () => {
            state.func.save(needSave => {
                if (needSave === false) {
                    env.dialogNotify('warn', 'no changes')
                } else if (needSave === true) {
                    env.dialogNotify('info', 'changes saved')
                }
            })
        }

        return {
            state,
            env,
            onLoad,
            onAdd,
            onUndo,
            onSave
        }
    }
}
</script>
<style lang="sass">
.noactive
    opacity: 0.7
</style>