import { reactive } from "vue"
import { notify } from "./dialog"
import { state as StateToken } from "./token"
import axios, { AxiosRequestHeaders, AxiosResponseHeaders } from "axios"
import { TPost, TReply } from "../../../src/api"
import { goto } from "./router"
import { debug } from "console"

type TResponse = { status: number; data: TReply }
type TQueueItem = { data: TPost; callback: (result: any | undefined, headers?: AxiosResponseHeaders) => void }

const queue: TQueueItem[] = []

export const state = reactive({
    accessAllow: true
})

export function clearQueue() {
    queue.splice(0, queue.length).forEach(q => {
        q.callback(undefined)
    })
}

export function send(data: TPost, callback: (result: any | undefined, headers?: AxiosResponseHeaders) => void) {
    queue.push({ data, callback })
}

let timer = setTimeout(async function tick() {
    if (!state.accessAllow) {
        timer = setTimeout(tick, 1000)
        return
    }
    const q = queue.shift()
    if (q) {
        sendCore(q.data, (error, result, headers) => {
            if (error) {
                notify("error", error)
                q.callback(undefined)
                return
            }
            if (!result) {
                notify("error", "empty response")
                q.callback(undefined)
                return
            }
            if (result.status === 403) {
                if (StateToken.token === (q.data as any).token) {
                    state.accessAllow = false
                    if (result.data?.error) {
                        notify("error", result.data.error)
                    }
                    goto("u-signin")
                }
                queue.unshift(q)
                return
            }
            if (result.status !== 200) {
                notify("error", result.data?.error || `response with status ${result.status}`)
                q.callback(undefined)
                return
            }
            if (!result.data) {
                notify("error", `empty data in response`)
                q.callback(undefined)
                return
            }

            q.callback(result.data, headers)
        })
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    timer = setTimeout(tick, 200)
}, 200)

export function sendCore(data: TPost, callback: (error: Error | undefined, response: TResponse | undefined, headers: AxiosRequestHeaders | undefined) => void) {
    ;(data as any).token = StateToken.token.toString()

    axios({
        url: "http://localhost:3000",
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        data: JSON.stringify(data),
        responseType: data.kind.indexOf("download") >= 0 ? "blob" : undefined
    })
        .then(function (response) {
            callback(undefined, { status: response.status || 400, data: response.data }, response?.headers)
        })
        .catch(error => {
            if (error.response) {
                callback(undefined, { status: error.response.status || 400, data: error.response.data }, undefined)
            } else {
                callback(error, undefined, undefined)
            }
        })
}
