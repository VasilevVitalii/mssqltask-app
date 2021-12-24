<template>
    <q-item-label v-show="size()" caption>
        <div>
            <div class="div-info">{{ kind }}, size {{ sizeFormat() }}</div>
            <div class="div-command">
                <q-btn flat dense size="sm" color="primary" label="download" @click="download()" />
                <div v-show="size() <= 10000000">
                    <q-btn flat dense size="sm" color="primary" label="show" @click="loadText()" />
                </div>
            </div>
        </div>
    </q-item-label>
</template>
<script lang="ts">
import { PropType, defineComponent } from "vue"
import { state } from "@/state/serviceLog"
import { TFileHistoryServiceLog } from "./../../../../src/api/serviceLog"

export default defineComponent({
    props: {
        item: {
            type: Object as PropType<TFileHistoryServiceLog>,
            required: true
        },
        kind: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const size = (): number | undefined => {
            if (props.kind === "error") return props.item["sizeError"]
            if (props.kind === "debug") return props.item["sizeDebug"]
            if (props.kind === "trace") return props.item["sizeTrace"]
            return undefined
        }

        const sizeFormat = (): string => {
            const s = size()
            if (!s) return ""
            const sizeMb = Math.round(s / 1000 / 1000)
            if (sizeMb <= 0) return "<1 Mb"
            return `${sizeMb} Mb`
        }

        const download = () => {
            state.download(props.item, props.kind as "error" | "debug" | "trace", (blob, fileName) => {
                if (!blob || !fileName) return
                const link = document.createElement("a")
                link.href = window.URL.createObjectURL(blob)
                link.download = fileName
                link.click()
            })
        }

        const loadText = () => {
            state.loadText(props.item, props.kind as "error" | "debug" | "trace")
        }

        return {
            size,
            sizeFormat,
            download,
            loadText
        }
    }
})
</script>
