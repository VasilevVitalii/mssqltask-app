<template>
    <q-toolbar style="height: 50px" :class="hasError()? 'bg-negative-light' : 'bg-positive-light'">
        <div v-show="state.data.tasks.length > 0" style="height: 100%">
            <div v-if="state.func.showDetailsByTask()" style="display: flex; height: 100%; align-items: center">
                <span> {{ state.func.showDetailsByTask().key }} </span>
                <q-separator style="margin: 10px 10px 10px 10px" vertical color="primary"/>
                <span> {{ countServersErrorText() }} </span>
                <q-separator style="margin: 10px 10px 10px 10px" vertical color="primary"/>
                <span> {{ showStoryWork(state.func.showDetailsByTask()?.story()?.dateStart) }} - {{ showStoryWork(state.func.showDetailsByTask()?.story()?.dateStop) }} </span>
                <q-separator style="margin: 10px 10px 10px 10px" vertical color="primary"/>
                <div v-show="state.func.showDetailsByTask()?.state === 'work'" style="align-self: center">
                    <q-spinner-dots color="primary" size="3em"/>
                </div>
                <div v-show="state.func.showDetailsByTask()?.state !== 'work'" style="align-self: center">
                    {{ showMsecAgo(state.func.showDetailsByTask()?.msecAgo) }}
                </div>
            </div>
            <div v-if="!state.func.showDetailsByTask()" style="display: flex; height: 100%; align-items: center">
                <span>{{ state.data.tasks.length }} task(s)</span>
                <q-separator style="margin: 10px 10px 10px 10px" vertical color="primary"/>
                <span> {{ countTasksErrorText() }} </span>
            </div>
        </div>
        <q-space/>
        <q-btn v-if="state.func.showDetailsByTask()" dense color="accent" flat label="goto task list" @click="state.data.showDetailsByTaskKey = undefined"/>
        <q-separator style="margin: 10px 10px 10px 10px" vertical color="primary"/>
        <q-btn dense color="accent" flat label="reconnect" @click="reconnect()"/>
    </q-toolbar>
</template>
<script lang="ts">
import { equal, toDate } from 'vv-common'
import { state } from './state'
import { state as stateMain } from '@/state'
import * as env from '@/core/_env'

export default {

    setup() {

        const countTasksError = (): number => {
            return state.data.tasks.filter(f => (f.story()?.servers || []).some(ff => ff.execError)).length
        }

        const countTasksErrorText = (): string => {
            const cnt = countTasksError()
            return cnt > 0 ? `${cnt} error(s)` : `no errors`
        }

        const countServersError = (): number => {
            const task = state.func.showDetailsByTask()
            if (!task) return 0
            return (task.story()?.servers || []).filter(f => f.execError).length
        }

        const countServersErrorText = (): string => {
            const cnt = countServersError()
            return cnt > 0 ? `${cnt} error(s)` : `no errors`
        }

        const showStoryWork = (ds: string | undefined) => {
            if (!ds) return ''
            const dd = toDate(ds)
            return dd ? env.showDateTime(dd) : ''
        }

        const hasError = (): boolean => {
            if (state.func.showDetailsByTask()) {
                return countServersError() > 0
            }
            return countTasksError() > 0
        }

        const reconnect = () => {
            state.func.stop()
            state.func.start()
        }

        return {
            state,
            stateMain,
            env,
            countTasksError,
            countTasksErrorText,
            countServersError,
            countServersErrorText,
            showStoryWork,
            hasError,
            reconnect,
            showMsecAgo: env.showMsecAgo,
        }
    }
}
</script>
<style lang="sass">
.noactive
    opacity: 0.7
</style>