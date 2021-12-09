<template>
    <Menu></Menu>
    <router-view />
</template>
<script lang="ts">
import Menu from "@/components/Menu.vue"
import { useQuasar } from "quasar"
import { onNotify } from "@/core/dialog"
import { onGoto } from "@/core/router"
import { onSetToken } from "@/core/token"
import { state as stateEdit } from "@/state/edit"

export default {
    components: {
        Menu
    },
    setup() {
        const $q = useQuasar()
        onNotify(notify => {
            $q.notify(notify)
        })

        onGoto((from, to, workflow) => {
            if (to?.url === "u-workflow" && workflow === "w-edit" && !stateEdit.loadedInit) {
                stateEdit.load()
            }
        })

        onSetToken((prev, curr) => {
            if (prev !== curr) {
                stateEdit.loadedInit = false
            }
        })
    }
}
</script>
