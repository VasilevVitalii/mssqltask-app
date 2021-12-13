import { env } from './../app'
import { Create as CreateHttpGate, TRequest } from 'vv-httpgate'
import * as apiSignin from './signin'
import * as apiEdit from './edit'
import * as apiTestConnection from './connection'

import { TDepotMssql } from './../depotMssql'
import { TDepotTask } from './../depotTask'
import { TServerInfo } from 'mssqldriver'

export type TPostSignin = {kind: 'signin', data: {password: string}}
export type TPostConnection = {kind: 'test-connection', token: string, data: {mssqls: TDepotMssql[]}}
export type TPostEditLoad = {kind: 'edit-load', token: string}
export type TPostEditDelete = {kind: 'edit-delete', token: string, data?: {mssqls: TDepotMssql[], tasks: TDepotTask[]}}
export type TPost = TPostSignin | TPostConnection | TPostEditLoad |  TPostEditDelete

export type TReplyUnknown = {kind: 'unknown'}
export type TReplySignin = {kind: 'signin', data?: {token: string}}
export type TReplyConnection = {kind: 'test-connection', data?: {mssqls: TDepotMssql[], errors: string[], infos: TServerInfo[] }}
export type TReplyEditLoad = {kind: 'edit-load', data?: {mssqls: TDepotMssql[], tasks: TDepotTask[]}}
export type TReplyEditDelete = {kind: 'edit-delete'}
export type TReply = {error?: string} & (TReplyUnknown | TReplySignin | TReplyConnection | TReplyEditLoad | TReplyEditDelete)
export type TReplyBox = {statusCode: number, reply: TReply}

export function Go() {
    if (!env.options.manage.allowApi) return

    const httpGate = CreateHttpGate({url: env.options.manage.http})
    httpGate.onError(error => {
        env.logger.error('API', error)
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

            const denyAccess = apiSignin.Check(post)
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
                sendReplyBox(request, apiSignin.Create(post?.data?.password))
                return
            }

            if (post?.kind === 'test-connection') {
                apiTestConnection.Test(post, replyBox => {
                    sendReplyBox(request, replyBox)
                })
                return
            }

            if (post?.kind === 'edit-load') {
                apiEdit.Load(replyBox => {
                    sendReplyBox(request, replyBox)
                })
                return
            }

            if (post?.kind === 'edit-delete') {
                apiEdit.Delete(post, replyBox => {
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
            env.logger.debug(`API - start at http://${addr.url}:${addr.port}`)
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