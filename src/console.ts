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
export type TReplyBox = {statusCode: number, reply: TReply}

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
            let post: TPost = undefined
            try {
                post = JSON.parse(request.data)
            } catch (error) {
                sendReplyBox (request, {
                    statusCode: 400,
                    reply: {
                        kind: 'unknown',
                        error: `error convert string data to json: ${(error as Error).message}`
                    }
                })
                return
            }

            const denyAccess = consoleSignin.Check(post)
            if (denyAccess) {
                sendReplyBox (request, {
                    statusCode: 403,
                    reply: {
                        kind: post?.kind,
                        error: denyAccess
                    }
                })
                return
            }

            if (post?.kind === 'signin') {
                sendReplyBox(request, consoleSignin.Create(post?.data?.password))
                return
            }

            if (post?.kind === 'edit-load') {
                consoleEdit.Load(post, replyBox => {
                    sendReplyBox(request, replyBox)
                })
                return
            }

            sendReplyBox (request, {
                statusCode: 400,
                reply: {
                    kind: 'unknown',
                    error: `unknown post data`
                }
            })
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

function sendReplyBox(request: TRequest, replyBox: TReplyBox): void {
    request.replySetHeader('content-type', 'application/json; charset=UTF-8')
    if (replyBox && replyBox.statusCode) {
        request.reply(replyBox.statusCode, replyBox.reply)
    } else {
        request.reply(500, {kind: 'unknown', error: 'unknown post data'} as TReply)
    }
}