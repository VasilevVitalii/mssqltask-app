import { reactive } from "vue"
import { stateNotife } from "@/store/notify"
import { stateToken } from "@/store/token"
import axios from "axios"
import { TPost, TReply } from "../../../src/console"
import { routerGoto } from "./router"

type TResponse = { status: number; data: TReply }
type TQueueItem = { data: TPost; callback: (result: any | undefined) => void }

export const stateRest = reactive({
    queue: [] as TQueueItem[],
    accessAllow: true
})

export function send(data: TPost, callback: (result: any | undefined) => void) {
    stateRest.queue.push({ data, callback })
}

let timer = setTimeout(async function tick() {
    // if (stateRest.queue.length > 0) {
    //     console.log(`queue ${stateRest.queue.length}, accessAllow ${stateRest.accessAllow}`)
    // }
    if (!stateRest.accessAllow) {
        timer = setTimeout(tick, 1000)
        return
    }
    const q = stateRest.queue.shift()
    if (q) {
        sendCore(q.data, (error, result) => {
            if (error) {
                stateNotife.list.push({ kind: "error", text: error })
                q.callback(undefined)
                return
            }
            if (!result) {
                stateNotife.list.push({ kind: "error", text: "empty response" })
                q.callback(undefined)
                return
            }
            if (result.status === 403) {
                if (stateToken.token === (q.data as any).token) {
                    stateRest.accessAllow = false
                    if (result.data?.error) {
                        stateNotife.list.push({ kind: "error", text: result.data.error })
                    }
                    routerGoto("u-signin")
                }
                stateRest.queue.unshift(q)
                return
            }
            if (result.status !== 200) {
                stateNotife.list.push({ kind: "error", text: result.data?.error || `response with status ${result.status}` })
                q.callback(undefined)
                return
            }
            if (!result.data) {
                stateNotife.list.push({ kind: "error", text: `empty data in response` })
                q.callback(undefined)
                return
            }

            q.callback(result.data)
        })
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    timer = setTimeout(tick, 200)
}, 200)

export function sendCore(data: TPost, callback: (error: Error | undefined, response: TResponse | undefined) => void) {
    console.log(`sendCore: ${stateToken.token}, ${stateToken.token.toString()}`)
    ;(data as any).token = stateToken.token.toString()
    axios({
        url: "http://localhost:3000",
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        data: JSON.stringify(data)
    })
        .then(function (response) {
            callback(undefined, { status: response.status || 400, data: response.data })
        })
        .catch(error => {
            if (error.response) {
                callback(undefined, { status: error.response.status || 400, data: error.response.data })
            } else {
                callback(error, undefined)
            }
        })
}
