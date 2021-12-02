<template>
    <div>
        <h1>Main - under constraction {{ workflow.value }}</h1>
    </div>
</template>
<script lang="ts">
import { workflow } from "@/router"
export default {
    setup() {
        return { workflow: workflow }
    }
}
</script>
