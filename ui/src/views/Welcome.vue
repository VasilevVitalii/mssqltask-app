<template>
    <div>
        <div style="display: flex; justify-content: center; margin: 5px 0px 0px 0px">
            <img src="@/assets/logo.png" />
        </div>
        <div style="display: flex; flex-flow: wrap; justify-content: center">
            <q-card square flat class="menu-card bg-primary text-white">
                <q-card-section>
                    <div class="text-h6 menu-title">realtime</div>
                    <div class="text-subtitle2 menu-text">realtime view work tasks</div>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat @click="routerGoto('/realtime')">go to</q-btn>
                </q-card-actions>
            </q-card>
            <q-card square flat class="menu-card bg-primary text-white">
                <q-card-section>
                    <div class="text-h6 menu-title">service log</div>
                    <div class="text-subtitle2 menu-text">view backend work log</div>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat @click="routerGoto('/historyservice')">go to</q-btn>
                </q-card-actions>
            </q-card>
            <q-card square flat class="menu-card bg-primary text-white">
                <q-card-section>
                    <div class="text-h6 menu-title">tasks history</div>
                    <div class="text-subtitle2 menu-text">view tasks work result</div>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat @click="routerGoto('/historytask')">go to</q-btn>
                </q-card-actions>
            </q-card>
            <q-card square flat class="menu-card bg-primary text-white">
                <q-card-section>
                    <div class="text-h6 menu-title">edit tasks</div>
                    <div class="text-subtitle2 menu-text">edit tasks and connections to MS SQL Servers</div>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat @click="routerGoto('/depot')">go to</q-btn>
                </q-card-actions>
            </q-card>
        </div>
    </div>
</template>
<script lang="ts">
import * as env from "@/core/_env"
export default {
    setup() {
        return { routerGoto: env.routerGoto, }
    }
}
</script>
<style lang="sass" scoped>
.menu-card
    width: 100%
    max-width: 250px
    margin: 5px
.menu-title
    height: 40px
.menu-text
    height: 30px
</style>
