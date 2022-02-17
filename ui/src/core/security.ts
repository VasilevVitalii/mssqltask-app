import { ref } from "vue"
import { TReplySignin } from "../../../src/api/onPost"
import { sendDirectly } from "./axios"
import { promt } from "./dialog"

export let token = ref((localStorage.getItem("token") as string) || "")
export function setToken(value: string) {
    token.value = value
    if (!token) {
        localStorage.removeItem("token")
    } else {
        localStorage.setItem("token", value)
    }
}

export function signin(callback: (token: string | undefined) => void) {
    promt('password', 'SIGN IN', 'enter password', '', password => {
        if (password === undefined) {
            callback(undefined)
            return
        }
        sendDirectly({kind: 'signin', password: password}, (status, reply) => {
            if (status === 200) {
                callback((reply as TReplySignin).token)
                return
            } else {
                signin(callback)
            }
        })
    })
}