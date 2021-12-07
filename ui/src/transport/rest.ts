import { stateNotife } from "@/store/notify"
import axios, { AxiosResponse } from "axios"
import { TPost, TReply } from "../../../src/console"
import { routerGoto } from "./router"

type TResponse = { status: number; data: TReply }

const queue: { data: TPost; callback: (result: any | undefined) => void }[] = []

export function send(data: TPost, callback: (result: any | undefined) => void) {
    queue.push({ data, callback })
}

let accessAllow = true

let timer = setTimeout(async function tick() {
    if (!accessAllow) {
        timer = setTimeout(tick, 1000)
        return
    }
    const q = queue.shift()
    if (q) {
        post(q.data, (error, result) => {
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
                accessAllow = false
                if (result.data?.error) {
                    stateNotife.list.push({ kind: "error", text: result.data.error })
                }
                routerGoto("u-signin")
                queue.unshift(q)
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

// export async function post(data: TPost): Promise<any | undefined> {
//     const res = await internal({
//         method: "POST",
//         headers: { "Content-Type": "application/json; charset=UTF-8" },
//         body: JSON.stringify(data)
//     })
//     if (res.error) {
//         stateNotife.list.push({ kind: "error", text: res.error })
//         return undefined
//     }
//     if (!res.response) {
//         stateNotife.list.push({ kind: "error", text: `Empty response` })
//         return undefined
//     }
//     return res.response
//     // if (res.response.status === 200 && data.kind === 'signin' && prev) {

//     // }
// }

// function post(data: TPost, callback: (error: Error | undefined, response: Response | undefined) => void) {
//     fetch("http://localhost:3000", {
//         method: "POST",
//         headers: { "Content-Type": "application/json; charset=UTF-8" },
//         body: JSON.stringify(data)
//     })
//         .then(function (response) {
//             callback(undefined, response)
//         })
//         .catch(error => {
//             callback(error, undefined)
//         })
// }

function post(data: TPost, callback: (error: Error | undefined, response: TResponse | undefined) => void) {
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
