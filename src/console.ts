import * as vv from 'vv-common'
import { env } from './app'
import { Create as CreateHttpGate } from 'vv-httpgate'
import { TRequest } from 'vv-httpgate/dist/src/replyRequest'

export type TPost =
    {kind: 'signin', data: {password: string}}

export function Go() {
    if (!env.options.console.allowApi) return

    const httpGate = CreateHttpGate({url: env.options.console.http})
    httpGate.onError(error => {
        env.logger.error('CONSOLE', error)
    })
    httpGate.onRequest(request => {
        if (request.method === 'GET') {
            console.log('not yet')
            return
        }
        if (request.method === 'POST') {
            const post = getPost(request)
            if (!post) return
            if (post.kind === 'signin') {
                const check = checkPassword(post.data?.password)
                if (!check) {
                    request.reply(403, `Incorrect password`)
                    return
                }
            } else {
                request.reply(400, `Unknown kind = ${post.kind}`)
            }

            return
        }
        request.reply(200, `hello from api`)
    })
    httpGate.onServerEvent(event => {
        event.reply(`hello from api`, (error, isOpened) => {
            if (error) {
                console.error(error)
            }
        })
        event.onClose(() => {
            console.log('event connection closed')
        })
    })
    httpGate.start(addr => {
        if (addr) {
            env.logger.debug(`CONSOLE - start at http://${addr.url}:${addr.port}`)
        }
    })
}

function getPost(request: TRequest): TPost {
    let data: TPost = undefined
    try {
        data = JSON.parse(request.data)
    } catch (error) {
        request.reply(400, `error convert string data to json: ${(error as Error).message}`)
        return undefined
    }
    return data
}

function checkPassword(password: string): ('view' | 'edit') {
    if (env.options.console.passwordEdit === password) return 'edit'
    if (env.options.console.passwordView === password) return 'view'
    return undefined
}