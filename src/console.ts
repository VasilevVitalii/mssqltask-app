import { env } from './app'
import { Create as CreateHttpGate, TRequest } from 'vv-httpgate'
import * as consoleSignin from './consoleSignin'
import * as consoleEdit from './consoleEdit'
import { TDepotMssql } from './depotMssql'
import { TDepotTask } from './depotTask'

export type TPostSignin = {kind: 'signin', data: {password: string}}
export type TPostEditLoad = {kind: 'edit-load', token: string}
export type TPost = TPostSignin | TPostEditLoad

export type TReplyUnknown = {kind: 'unknown'}
export type TReplySignin = {kind: 'signin', data?: {token: string}}
export type TReplyEditLoad = {kind: 'edit-load', data?: {mssqls: {path: string, file: string, data: TDepotMssql}[], tasks: {path: string, file: string, data: TDepotTask}[]}}
export type TReply = {error?: string} & (TReplyUnknown | TReplySignin | TReplyEditLoad)
export type TReplyBox = {statusCode?: number, reply?: TReply}

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
            let statusCode = undefined as number
            const replyBox: TReplyBox = {}

            let post: TPost = undefined
            try {
                post = JSON.parse(request.data)
            } catch (error) {
                replyBox.statusCode = 400
                replyBox.reply = {kind: 'unknown', error: `error convert string data to json: ${(error as Error).message}`}
            }
            replyBox.reply = {
                kind: post?.kind || 'unknown'
            }

            if (replyBox.reply.kind === 'signin') {
                statusCode = consoleSignin.Create(reply, (post as TPostSignin)?.data?.password)
            } //else if (post?.kind === 'edit-load') {

            //     if (consoleSignin.Check(post?.token, 'view')) {
            //         console.log('ok')
            //     } else {
            //         console.log('bad')
            //     }
            // } else {
            //     replyBox.statusCode = 400
            //     replyBox.reply = {
            //         kind: 'unknown',
            //         error: `unknown kind "${post['kind']}"`
            //     }
            // }

            // if (!post) return
            // if (post.kind === EKind.signin) {
            //     consoleSignin.Create(request, post)
            // } else if (post.kind === EKind.editLoad) {
            //     const denyText = consoleSignin.Check(post.token, 'edit')
            //     if (denyText) {
            //         request.reply(403, {} as TReplySignin)
            //         return
            //     }
            //     consoleEdit.Load(request)
            // } else {
            //     request.reply(400, `unknown kind "${post['kind']}"`)
            // }

            request.reply(statusCode || 500, reply)
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