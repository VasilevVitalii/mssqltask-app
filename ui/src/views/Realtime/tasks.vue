<template>
    <div style="display: flex; flex-flow: wrap; justify-content: center">
        <div v-for="(itemTask, idxTask) in state.data.tasks" :key="idxTask" style="margin: 5px; min-width: 350px"
            :class="(itemTask.story()?.servers || []).some(f => f.execError) ? 'bg-negative-light' : 'bg-positive-light'">
            <div class="text-h5" style="display: flex; width: 100%; height: 35px; margin: 2px 0px 2px 2px">
                <div>
                    {{ itemTask.key }}
                </div>
                <q-space/>
                <q-btn size="xs" dense color="accent" flat label="open" @click="state.data.showDetailsByTaskKey = itemTask.key" style="margin: 0px 4px 0px 0px; align-self: start"/>
            </div>
            <div style="display: flex; width: 100%; height: 22px; margin: 0px 0px 0px 5px">
                <div v-for="(itemStory, idxStory) in itemTask.stories" :key="idxStory" style="margin: 0px 0px 0px 2px">
                    <q-badge :color="itemStory.servers.some(f => f.execError) ? 'negative' : 'positive' "/>
                </div>
                <q-space></q-space>
                <div v-show="itemTask.state === 'work'" style="margin: 0px 10px 2px 0px; align-self: center">
                    <q-spinner-dots color="primary" size="3em"/>
                </div>
                <div v-show="itemTask.state !== 'work'" style="margin: 0px 10px 0px 0px">
                    {{ showMsecAgo(itemTask.msecAgo) }}
                </div>
            </div>
            <div style="width: 100%; height: 22px">
                <div v-if="itemTask.stories.length > 0" style="text-align: center"
                    :class="(itemTask.story()?.servers || []).some(f => f.execError)  ? 'bg-negative text-white' : ''"
                    >
                    {{ showStoryWork(itemTask.story()?.dateStart) }} - {{ showStoryWork(itemTask.story()?.dateStop) }}
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { ref } from 'vue'
import { state } from './state'
import { toDate } from 'vv-common'
import * as env from '@/core/_env'

export default {
    setup() {

        const showStoryWork = (ds: string | undefined) => {
            if (!ds) return ''
            const dd = toDate(ds)
            return dd ? env.showDateTime(dd) : ''
        }

        return {
            showStoryWork,
            showMsecAgo: env.showMsecAgo,
            state,
            pagination: ref({
                rowsPerPage: 0
            }),
        }
    }
}
</script>