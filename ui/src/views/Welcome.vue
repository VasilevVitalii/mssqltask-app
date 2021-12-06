<template>
    <div>
        <div style="display: flex; justify-content: center; margin: 5px 0px 0px 0px">
            <img src="@/assets/logo.png" />
        </div>
        <div style="display: flex; flex-flow: wrap; justify-content: center">
            <q-card square flat class="menu-card bg-primary text-white">
                <q-card-section>
                    <div class="text-h6 menu-title">Dashboard</div>
                    <div class="text-subtitle2 menu-text">realtime view work tasks</div>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat @click="goto('w-dashboard')">go to</q-btn>
                </q-card-actions>
            </q-card>
            <q-card square flat class="menu-card bg-primary text-white">
                <q-card-section>
                    <div class="text-h6 menu-title">History</div>
                    <div class="text-subtitle2 menu-text">history work task - performance analysis, viewing results</div>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat @click="goto('w-history')">go to</q-btn>
                </q-card-actions>
            </q-card>
            <q-card square flat class="menu-card bg-primary text-white">
                <q-card-section>
                    <div class="text-h6 menu-title">Edit</div>
                    <div class="text-subtitle2 menu-text">edit tasks and connections to MS SQL Servers</div>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat @click="goto('w-edit')">go to</q-btn>
                </q-card-actions>
            </q-card>
        </div>
    </div>
</template>
<script lang="ts">
import { goto, post } from "@/router"
export default {
    setup() {
        return { goto: goto, post: post }
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
