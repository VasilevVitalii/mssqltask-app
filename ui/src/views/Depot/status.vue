<template>
    <div class="text-white bg-primary" style="height: 30px; width: 100%; display: flex">
        <div style="align-self: center; margin: 0px 0px 0px 10px" class="noactive">
            loaded {{ state.data.servers.length }} server(s) and {{ state.data.tasks.length }} task(s)
        </div>
        <div v-show="state.func.hasChanges()" style="display: flex; align-self: center" class="noactive">
            <q-separator style="margin: 2px 10px 2px 10px" vertical color="white" />
            has changes
        </div>
    </div>
</template>
<script lang="ts">
import { state } from './state'
import * as env from '@/core/_env'

export default {
    setup() {
        return {
            state,
            env
        }
    }
}
</script>
<style lang="sass">
.noactive
    opacity: 0.7
</style>