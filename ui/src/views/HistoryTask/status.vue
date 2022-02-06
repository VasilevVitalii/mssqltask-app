<template>
    <div class="text-white bg-primary" style="height: 30px; width: 100%; display: flex">
        <div v-show="state.data.viewBy === 'date'" style="align-self: center; margin: 0px 0px 0px 10px" class="noactive">
            full statistic loaded by {{ state.data.itemsByDate.filter(f => !f.items.some(ff => ff.stat.length <= 0)).length }} day(s), errors in {{ state.data.itemsByDate.filter(f => !f.items.some(ff => ff.stat.length <= 0)).filter(f => f.items.some(ff => ff.hasError())).length }} day(s)
        </div>
        <div v-show="state.data.viewBy === 'task'" style="align-self: center; margin: 0px 0px 0px 10px" class="noactive">
            full statistic loaded by {{ state.data.itemsByTask.filter(f => !f.items.some(ff => ff.stat.length <= 0)).length }} task(s), errors in {{ state.data.itemsByTask.filter(f => !f.items.some(ff => ff.stat.length <= 0)).filter(f => f.items.some(ff => ff.hasError())).length }} task(s)
        </div>
        <div style="display: flex; align-self: center; margin: 0px 0px 0px 10px" class="noactive" v-if="state.data.itemView">
            <q-separator style="margin: 2px 10px 2px 10px" vertical color="white" />
            view statistics by task "{{ state.data.itemView.task }}" on date {{env.showDate(state.data.itemView.d)}}, {{state.data.itemView.stat.length}} exec(s)
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