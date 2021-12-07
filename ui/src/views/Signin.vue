<template>
    <div>
        <div style="width: 300px">
            <q-input v-model="password" square outlined :type="isPwd ? 'password' : 'text'" label="Enter password">
                <template v-slot:append>
                    <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
                </template>
            </q-input>
        </div>
        <div style="width: 300px; text-align: right; margin: 10px 0px 0px 0px">
            <q-btn flat color="primary">sign in</q-btn>
            <q-btn flat color="negative">cancel</q-btn>
        </div>
    </div>
</template>

<script lang="ts">
import { ref } from "vue"
import { stateToken } from "@/store/token"

export default {
    setup() {
        return {
            password: ref(""),
            isPwd: ref(true)
        }
    }
}
</script>
