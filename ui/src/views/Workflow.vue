<template>
    <div>
        <div v-show="workflow.value === 'w-dashboard'">
            <ComponentDashboard />
        </div>
        <div v-show="workflow.value === 'w-history'">
            <ComponentHistory />
        </div>
        <div v-show="workflow.value === 'w-edit'">
            <ComponentEdit />
        </div>
    </div>
</template>
<script lang="ts">
import ComponentDashboard from "@/components/Dashboard/_root.vue"
import ComponentHistory from "@/components/History/_root.vue"
import ComponentEdit from "@/components/Edit/_root.vue"

import { workflow } from "@/router"
export default {
    components: {
        ComponentDashboard,
        ComponentHistory,
        ComponentEdit
    },
    setup() {
        return { workflow: workflow }
    }
}
</script>
