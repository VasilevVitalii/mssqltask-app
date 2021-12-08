import { reactive, computed } from "vue"
import { sendCore, stateRest } from "@/transport/rest"
import { stateNotife } from "@/store/notify"
import { routerGoto } from "@/transport/router"
import { TReplySignin } from "../../../src/console"

export const stateToken = reactive({
    token: (localStorage.getItem("token") as string) || "",
    buzy: false
})

export function setToken(token: string) {
    stateToken.token = token
    localStorage.setItem("token", token)
}

export function cancel() {
    stateRest.accessAllow = false
    const queue = stateRest.queue.splice(0, stateRest.queue.length)
    queue.forEach(q => {
        q.callback(undefined)
    })
    setToken("")
    routerGoto("u-welcome")
}

export function signin(password: string) {
    stateToken.buzy = true
    sendCore({ kind: "signin", data: { password: password } }, (error, response) => {
        if (error) {
            stateRest.accessAllow = false
            setToken("")
            stateNotife.list.push({ kind: "error", text: error })
        } else if (!response) {
            stateRest.accessAllow = false
            setToken("")
            stateNotife.list.push({ kind: "error", text: "empty response" })
        } else if (response.status !== 200) {
            stateRest.accessAllow = false
            setToken("")
            stateNotife.list.push({ kind: "error", text: response.data?.error || `response with status ${response.status}` })
        } else {
            setToken((response.data as TReplySignin).data?.token || "")
            stateRest.accessAllow = true
            routerGoto("u-workflow")
        }
        stateToken.buzy = false
    })
}
