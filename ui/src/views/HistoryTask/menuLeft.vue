<template>
    <div>
        <div style="align-items: baseline">
            <q-btn flat color="accent" @click="state.func.load()" :label="state.data.countLoad > 0 ? 'reload' : 'load'" style="margin: 0px 0px 5px 5px" />
            <q-btn-dropdown color="accent" flat :label="'view by ' + state.data.viewBy" style="float: right">
                <q-list>
                    <q-item clickable v-close-popup @click="state.data.viewBy = 'date'">
                    <q-item-section>
                        <q-item-label>DATE</q-item-label>
                    </q-item-section>
                    </q-item>

                    <q-item clickable v-close-popup @click="state.data.viewBy = 'task'">
                    <q-item-section>
                        <q-item-label>TASK</q-item-label>
                    </q-item-section>
                    </q-item>
                </q-list>
            </q-btn-dropdown>
        </div>
        <div v-show="state.data.itemsByDate.length > 0 || state.data.itemsByTask.length > 0">
            <div v-show="state.data.viewBy === 'date'">
                <div v-for="(item, idx) in state.data.itemsByDate" :key="idx" style="margin: 0px 0px 0px 15px">
                    <q-expansion-item
                        expand-separator
                        :label="env.showDate(item.d)"
                        :caption="item.items.some(f => f.hasError()) ? 'has error' : '   '"
                        :header-class="item.items.some(f => f.hasError()) ? 'text-negative' : undefined"
                        group="g"
                    >
                        <div>
                            <q-btn v-if="item.items.some(f => f.stat.length <= 0)" flat color="accent" size="sm" label="load all tasks by date" @click="state.func.loadStat(item.items.filter(f => !f.statDay))" style="margin-left: auto; display: block"/>
                            <div v-for="(item, idx) in item.items" :key="idx" >
                                <div style="display: flex">
                                    <div :class="item.hasError() ? 'text-negative' : undefined">
                                        {{ item.task }}
                                    </div>
                                    <q-space/>
                                    <q-btn flat color="accent" size="sm" label="load" @click="state.func.loadStat([item], () => {if (item.stat.length > 0) state.data.itemView = item})" style="margin-left: auto; display: block"/>    
                                    <q-btn v-if="item.stat.length > 0" flat color="accent" size="sm" label="view" @click="state.data.itemView = item" style="margin-left: auto; display: block"/>
                                </div>
                            </div>
                        </div>
                    </q-expansion-item>
                </div>
            </div>
            <div v-show="state.data.viewBy === 'task'">
                <div v-for="(item, idx) in state.data.itemsByTask" :key="idx" style="margin: 0px 0px 0px 15px">
                    <q-expansion-item
                        expand-separator
                        :label="item.task"
                        :caption="item.items.some(f => f.hasError()) ? 'has error' : '   '"
                        :header-class="item.items.some(f => f.hasError()) ? 'text-negative' : undefined"
                        group="g"
                    >
                        <q-btn v-if="item.items.some(f => f.stat.length <= 0)" flat color="accent" size="sm" label="load all dates by task" @click="state.func.loadStat(item.items.filter(f => !f.statDay))" style="margin-left: auto; display: block"/>
                        <div v-for="(item, idx) in item.items" :key="idx" >
                            <div style="display: flex">
                                <div :class="item.hasError() ? 'text-negative' : undefined">
                                    {{ env.showDate(item.d) }}
                                </div>
                                <q-space/>
                                <q-btn flat color="accent" size="sm" label="load" @click="state.func.loadStat([item],() => {if (item.stat.length > 0) state.data.itemView = item})" style="margin-left: auto; display: block"/>
                                <q-btn v-if="item.stat.length > 0" flat color="accent" size="sm" label="view" @click="state.data.itemView = item" style="margin-left: auto; display: block"/>
                            </div>
                        </div>
                    </q-expansion-item>
                </div>
            </div>
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