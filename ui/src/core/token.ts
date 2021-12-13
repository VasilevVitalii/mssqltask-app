import { reactive } from "vue"
import { state as stateRest, clearQueue } from "./rest"
import { sendCore } from "./rest"
import { goto } from "./router"
import { TReplySignin } from "../../../src/api"
import { notify } from "./dialog"

const callbacksOnSetToken: ((prev: string, current: string) => void)[] = []

export function onSetToken(callback: (prev: string, current: string) => void) {
    callbacksOnSetToken.push(callback)
}

export const state = reactive({
    token: (localStorage.getItem("token") as string) || "",
    buzy: false
})

export function setToken(token: string) {
    const prev = state.token
    state.token = token
    localStorage.setItem("token", token)
    callbacksOnSetToken.forEach(f => {
        f(prev, state.token)
    })
}

export function cancel() {
    stateRest.accessAllow = false
    clearQueue()
    setToken("")
    goto("u-welcome")
}

export function signin(password: string) {
    state.buzy = true
    sendCore({ kind: "signin", data: { password: password } }, (error, response) => {
        if (error) {
            stateRest.accessAllow = false
            setToken("")
            notify("error", error)
        } else if (!response) {
            stateRest.accessAllow = false
            setToken("")
            notify("error", "empty response")
        } else if (response.status !== 200) {
            stateRest.accessAllow = false
            setToken("")
            notify("error", response.data?.error || `response with status ${response.status}`)
        } else {
            setToken((response.data as TReplySignin).data?.token || "")
            stateRest.accessAllow = true
            goto("u-workflow")
        }
        state.buzy = false
    })
}
