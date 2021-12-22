<template>
    <div style="display: flex">
        <q-btn-dropdown flat dense size="sm" color="primary" :label="metronom.kind" style="margin: 2px 5px 0px 0px">
            <q-list>
                <q-item clickable v-close-popup @click="metronom.kind = 'cron'">
                    <q-item-section>
                        <q-item-label>cron</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="metronom.kind = 'custom'">
                    <q-item-section>
                        <q-item-label>custom</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-btn-dropdown>
        <q-input dense v-model="metronom.cron" v-show="metronom.kind === 'cron'" borderless placeholder="enter cron" />
        <q-btn-dropdown v-show="metronom.kind === 'custom'" flat dense size="sm" color="primary" label="change" style="margin: 2px 5px 0px 0px">
            <q-list dense style="width: 200px">
                <q-item class="metronom-list">
                    <q-checkbox v-model="metronom.weekdayMon" label="monday" />
                </q-item>
                <q-item class="metronom-list">
                    <q-checkbox v-model="metronom.weekdayTue" label="tuesday" />
                </q-item>
                <q-item class="metronom-list">
                    <q-checkbox v-model="metronom.weekdayWed" label="wednesday" />
                </q-item>
                <q-item class="metronom-list">
                    <q-checkbox v-model="metronom.weekdayThu" label="thursday" />
                </q-item>
                <q-item class="metronom-list">
                    <q-checkbox v-model="metronom.weekdayFri" label="friday" />
                </q-item>
                <q-item class="metronom-list">
                    <q-checkbox v-model="metronom.weekdaySat" label="saturday" />
                </q-item>
                <q-item class="metronom-list">
                    <q-checkbox v-model="metronom.weekdaySun" label="sunday" />
                </q-item>
                <q-item class="metronom-list">
                    <q-btn-toggle
                        unelevated
                        dense
                        v-model="metronom.periodicity"
                        :options="[
                            { label: 'every', value: 'every' },
                            { label: 'once', value: 'once' }
                        ]" />
                </q-item>
                <q-item>
                    <q-input
                        style="margin: 10px 0px 10px 0px"
                        dense
                        v-model="metronom.number"
                        outlined
                        square
                        :label="metronom.periodicity === 'every' ? 'period in min' : 'mins after midnight'">
                    </q-input>
                </q-item>
            </q-list>
        </q-btn-dropdown>
    </div>
</template>
<script lang="ts">
import { PropType, defineComponent } from "vue"
import { TTask } from "@/state/edit"

export default defineComponent({
    props: {
        item: {
            type: Object as PropType<TTask>,
            required: true
        }
    },
    setup(props) {
        return {
            metronom: props.item.item.state.metronom
        }
    }
})
</script>
<style lang="sass">
.metronom-list
    margin: 0px 20px 0px 20px
</style>
