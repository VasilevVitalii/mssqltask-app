<template>
    <Menu></Menu>
    <router-view />
</template>
<script lang="ts">
import Menu from "@/components/Menu.vue"
export default {
    components: {
        Menu
    }
}
</script>
