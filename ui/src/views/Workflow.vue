<template>
    <div>
        <div v-show="currentWorkflow === 'w-dashboard'">
            <ComponentDashboard />
        </div>
        <div v-show="currentWorkflow === 'w-history'">
            <ComponentHistory />
        </div>
        <div v-show="currentWorkflow === 'w-edit'">
            <ComponentEdit />
        </div>
    </div>
</template>
<script lang="ts">
import ComponentDashboard from "@/components/Dashboard/_root.vue"
import ComponentHistory from "@/components/History/_root.vue"
import ComponentEdit from "@/components/Edit/_root.vue"
import { state } from "@/core/router"

export default {
    components: {
        ComponentDashboard,
        ComponentHistory,
        ComponentEdit
    },
    setup() {
        return { currentWorkflow: state.currentWorkflow }
    }
}
</script>
