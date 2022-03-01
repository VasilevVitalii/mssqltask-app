
import { notify } from "./dialog"
import axios, { AxiosRequestHeaders, AxiosResponseHeaders } from "axios"
import { TPost, TReply } from "../../../src/api/onPost"
import {token, setToken, signin} from './security'
import { values } from './understudyValues'

const posts: { data: TPost; callback: (result: any | undefined, headers?: AxiosResponseHeaders) => void }[] = []

export async function send(data: TPost, callback: (result: any | undefined, headers?: AxiosResponseHeaders) => void) {
    posts.push({ data, callback })
}

export function sendDirectly(post: TPost, callback: (status: number, reply: TReply | undefined, headers: AxiosRequestHeaders | undefined) => void) {
    (post as any).token = token.value

    //in project compile replaced by "window.location.protocol + '//' + window.location.host"
    //const replaceInCompileUrl = "http://localhost:3084"

    axios({
        url: values.backendUrl,
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        data: JSON.stringify(post),
        responseType: post.kind.indexOf("Download") >= 0 ? "blob" : undefined
    })
        .then(function (response) {
            if (response.status === 200) {
                if (!response.data) {
                    notify("error", `status=500, empty response.data`)
                    callback(500, undefined, undefined)
                } else {
                    callback(200, response.data, response.headers)
                }
            } else {
                notify("error", `status=${response.status}, ${response.data}`)
                callback(response.status, undefined, undefined)
            }
        })
        .catch(error => {
            if (error.response) {
                notify("error", `status=${error.response.status}, ${error.response.data}`)
                callback(error.response.status || 400, undefined, undefined)
            } else {
                notify("error", error)
                callback(400, undefined, undefined)
            }
        })
}

let timer = setTimeout(async function tick() {
    const q = posts.shift()
    if (!q) {
        timer = setTimeout(tick, 200)
        return
    }

    sendDirectly(q.data, (status, result, headers) => {
        if (status === 403) {
            posts.unshift(q)
            signin(token => {
                if (token) {
                    setToken(token)
                } else {
                    posts.splice(0, posts.length).forEach(p => {p.callback(undefined, undefined)})
                }
                timer = setTimeout(tick, 200)
            })
        } else {
            q.callback(result, headers)
            timer = setTimeout(tick, 200)
        }
    })
}, 200)
