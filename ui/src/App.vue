<template>
    <Menu></Menu>
    <router-view />
</template>
<script lang="ts">
import Menu from "@/components/Menu.vue"
import { useQuasar } from "quasar"
import { stateNotife } from "@/store/notify"

export default {
    components: {
        Menu
    },
    setup() {
        const $q = useQuasar()
        let timer = setTimeout(function tick() {
            let m = stateNotife.list.shift()
            while (m) {
                const type = m.kind === "error" ? "negative" : m.kind === "warn" ? "warning" : "positive"
                // eslint-disable-next-line prettier/prettier
                const message = typeof m.text === "string" ? m.text : Array.isArray(m.text) ? m.text.map(m => { return typeof m === "string" ? m : m.message }).join("") : m.text.message
                const timeout = m.kind === "error" ? 5000 : m.kind === "warn" ? 3000 : 2000
                $q.notify({
                    type: type,
                    message: message,
                    timeout: timeout
                })
                m = stateNotife.list.shift()
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            timer = setTimeout(tick, 1000)
        }, 1000)
    }
}
</script>
