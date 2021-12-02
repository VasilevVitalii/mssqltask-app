<template>
    <div>
        <h1>Main - under constraction {{ console.value }}</h1>
    </div>
</template>
<script lang="ts">
import { console } from "@/router"
export default {
    setup() {
        return { console: console }
    }
}
</script>
