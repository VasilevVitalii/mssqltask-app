<template>
    <div>
        <div v-show="stateRouter.currentWorkflow === 'w-dashboard'">
            <ComponentDashboard />
        </div>
        <div v-show="stateRouter.currentWorkflow === 'w-history'">
            <ComponentHistory />
        </div>
        <div v-show="stateRouter.currentWorkflow === 'w-edit'">
            <ComponentEdit />
        </div>
    </div>
</template>
<script lang="ts">
import ComponentDashboard from "@/components/Dashboard/_root.vue"
import ComponentHistory from "@/components/History/_root.vue"
import ComponentEdit from "@/components/Edit/_root.vue"

import { stateRouter } from "@/transport/router"
export default {
    components: {
        ComponentDashboard,
        ComponentHistory,
        ComponentEdit
    },
    setup() {
        return { stateRouter }
    }
}
</script>
