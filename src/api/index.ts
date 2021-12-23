import { env } from './../app'
import { Create as CreateHttpGate, TRequest } from 'vv-httpgate'
import * as apiSecurity from './security'
import * as apiEdit from './edit'
import * as apiTestConnection from './connection'
import * as apiServiceLog from './serviceLog'

import { TDepotMssql } from './../depotMssql'
import { TDepotTask } from './../depotTask'
import { TServerInfo } from 'mssqldriver'

export type TPostSignin = {kind: 'signin', data: {password: string}}
export type TPostConnection = {kind: 'test-connection', token: string, data: {mssqls: TDepotMssql[]}}
export type TPostEditLoad = {kind: 'edit-load', token: string}
export type TPostEditDelete = {kind: 'edit-delete', token: string, data?: {mssqls: TDepotMssql[], tasks: TDepotTask[]}}
export type TPostEditChange = {kind: 'edit-change', token: string, data?: {mssqls: TDepotMssql[], tasks: TDepotTask[]}}
export type TPostHistoryServiceLog = {kind: 'history-service-log', token: string, data?: {dd1: string, dd2: string}}
export type TPostHistoryServiceLogItem = {kind: 'history-service-log-item', token: string, data?: {dd: string, kind: 'error' | 'debug' | 'trace'}}
export type TPostHistoryServiceLogItemDownload = {kind: 'history-service-log-item-download', token: string, data?: {dd: string, kind: 'error' | 'debug' | 'trace'}}
export type TPost = TPostSignin | TPostConnection | TPostEditLoad |  TPostEditDelete | TPostEditChange | TPostHistoryServiceLog | TPostHistoryServiceLogItem | TPostHistoryServiceLogItemDownload

export type TReplyUnknown = {kind: 'unknown'}
export type TReplySignin = {kind: 'signin', data?: {token: string}}
export type TReplyConnection = {kind: 'test-connection', data?: {mssqls: TDepotMssql[], errors: string[], infos: TServerInfo[] }}
export type TReplyEditLoad = {kind: 'edit-load', data?: {mssqls: TDepotMssql[], tasks: TDepotTask[]}}
export type TReplyEditDelete = {kind: 'edit-delete'}
export type TReplyEditChange = {kind: 'edit-change'}
export type TReplyHistoryServiceLog = {kind: 'history-service-log', data?: {files: apiServiceLog.TFileHistoryServiceLog[]}}
export type TReplyHistoryServiceLogItem = {kind: 'history-service-log-item', data?: {text: string}}
export type TReplyHistoryServiceLogItemDownload = {kind: 'history-service-log-item-download'}
export type TReply = {error?: string} & (TReplyUnknown | TReplySignin | TReplyConnection | TReplyEditLoad | TReplyEditDelete | TReplyEditChange | TReplyHistoryServiceLog | TReplyHistoryServiceLogItem | TReplyHistoryServiceLogItemDownload)
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

            const denyAccess = apiSecurity.CheckToken(post)
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
                sendReplyBox(request, apiSecurity.CreateToken(post?.data?.password))
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

            if (post?.kind === 'edit-change') {
                apiEdit.Change(post, replyBox => {
                    sendReplyBox(request, replyBox)
                })
                return
            }

            if (post?.kind === 'history-service-log') {
                apiServiceLog.LoadList(post, replyBox => {
                    sendReplyBox(request, replyBox)
                })
                return
            }

            if (post?.kind === 'history-service-log-item') {
                apiServiceLog.LoadText(post, replyBox => {
                    sendReplyBox(request, replyBox)
                })
                return
            }

            if (post?.kind === 'history-service-log-item-download') {
                const fullFileName = apiServiceLog.GetLogFullFileName(post.data?.dd, post.data?.kind)
                if (!fullFileName) {
                    sendReplyBox(request, {
                        statusCode: 400,
                        reply: {
                            kind: 'history-service-log-item-download',
                            error: 'empty data.dd or data.kind'
                        }
                    })
                    return
                }
                request.replyFile({fullFileName: fullFileName}, error => {
                    if (error) {
                        sendReplyBox(request, {
                            statusCode: 500,
                            reply: {
                                kind: 'history-service-log-item-download',
                                error: error.message
                            }
                        })
                    }
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