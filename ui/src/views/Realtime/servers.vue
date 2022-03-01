<template>
    <div style="display: flex; flex-flow: wrap; justify-content: center">
        <div v-for="(itemServer, idxServer) in (state.func.showDetailsByTask()?.story()?.servers || [])" :key="idxServer" style="margin: 5px; width: 350px"
            :class="itemServer.execError ? 'bg-negative-light' : 'bg-positive-light'">
            <div class="text-h5" style="width: 100%; height: 35px; margin: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ itemServer.title }}
            </div>
            <div v-show="itemServer.execError" style="width: 100%; height: 44px; margin: 2px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                {{ itemServer.execError }}
            </div>
            <div v-show="!itemServer.execError && itemServer.messages && itemServer.messages.length === 1" style="width: 100%; height: 44px; margin: 2px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                {{ itemServer.messages[0] }}
            </div>
            <div v-show="!itemServer.execError && itemServer.messages && itemServer.messages.length > 1" style="width: 100%; min-height: 44px; margin: 2px; display: grid">
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" v-for="(item, idx) in itemServer.messages" :key="idx">
                    {{ item }}
                </span>
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