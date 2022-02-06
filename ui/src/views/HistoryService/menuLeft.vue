<template>
    <div>
        <q-btn flat color="accent" @click="state.func.load()" :label="state.data.countLoad > 0 ? 'reload' : 'load'" style="margin: 0px 0px 5px 5px" />
        <div v-for="(item, idx) in state.data.items" :key="idx" style="margin: 0px 0px 0px 15px">
            <q-expansion-item
                expand-separator
                :label="env.showDate(item.d)"
                :caption="item.fileError && item.sizeError > 0 ? 'has error' : '   '"
                :header-class="item.fileError && item.sizeError > 0 ? 'text-negative' : undefined"
                group="g"
            >
                <div style="margin: 0px 0px 10px 0px">
                    <div v-show="item.fileError && item.sizeError > 0" style="display: flex; align-items: center">
                        <q-chip square style="min-width: 130px">
                            <q-avatar color="negative" text-color="white" style="width: 50px">error</q-avatar>
                            {{env.showFileSize(item.sizeError)}}
                        </q-chip>
                        <q-btn-group outline>
                            <q-btn flat color="accent" size="sm" label="download" @click="downloadFile(item.fileError)" />
                            <q-btn flat color="accent" size="sm" label="view" @click="state.func.view('error', item)" />
                        </q-btn-group>
                    </div>
                    <div v-show="item.fileDebug && item.sizeDebug > 0" style="display: flex; align-items: center">
                        <q-chip square style="min-width: 130px">
                            <q-avatar color="secondary" text-color="white" style="width: 50px">debug</q-avatar>
                            {{env.showFileSize(item.sizeDebug)}}
                        </q-chip>
                        <q-btn-group outline>
                            <q-btn flat color="accent" size="sm" label="download" @click="downloadFile(item.fileDebug)"/>
                            <q-btn flat color="accent" size="sm" label="view" @click="state.func.view('debug', item)" />
                        </q-btn-group>
                    </div>
                    <div v-show="item.fileTrace && item.sizeTrace > 0" style="display: flex; align-items: center">
                        <q-chip square style="min-width: 130px">
                            <q-avatar color="secondary" text-color="white" style="width: 50px">trace</q-avatar>
                            {{env.showFileSize(item.sizeTrace)}}
                        </q-chip>
                        <q-btn-group outline>
                            <q-btn flat color="accent" size="sm" label="download" @click="downloadFile(item.fileTrace)"/>
                            <q-btn flat color="accent" size="sm" label="view" @click="state.func.view('trace', item)" />
                        </q-btn-group>
                    </div>
                </div>
            </q-expansion-item>
        </div>
    </div>
</template>
<script lang="ts">
import state from './state'
import * as env from '@/core/_env'

export default {

    setup() {
        const downloadFile = (file: string) => {
            env.api.historyServiceItemDownload({file}, (blob, filename) => {
                if (!blob || !filename) return
                const link = document.createElement("a")
                link.href = window.URL.createObjectURL(blob)
                link.download = filename
                link.click()
            })
        }

        return {
            state,
            env,
            downloadFile
        }
    }
}
</script>