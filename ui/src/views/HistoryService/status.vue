<template>
    <div class="text-white bg-primary" style="height: 30px; width: 100%; display: flex">
        <div style="align-self: center; margin: 0px 0px 0px 10px" class="noactive">
            loaded {{state.data.items.length}} day(s), errors in {{ state.data.items.filter(f => f.fileError && f.sizeError > 0).length }} day(s)
        </div>
        <div style="display: flex; align-self: center; margin: 0px 0px 0px 10px" class="noactive" v-if="state.data.view">
            <q-separator style="margin: 2px 10px 2px 10px" vertical color="white" />
            view file "{{state.data.view.type}}" on date {{env.showDate(state.data.view.item.d)}}, file has {{state.data.view.countLines}} line(s)
        </div>
    </div>
</template>
<script lang="ts">
import state from './state'
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