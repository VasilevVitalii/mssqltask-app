import path from 'path'
import * as vv from 'vv-common'
import { env } from './../app'
import { Create as CreateHttpGate, TRequest } from 'vv-httpgate'
import * as apiSecurity from './security'
import * as apiEdit from './edit'
import * as apiTestConnection from './connection'
import * as apiServiceLog from './serviceLog'
import * as apiTaskLog from './taskLog'
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
export type TPostHistoryTaskLog = {kind: 'history-task-log', token: string, data?: {dd1: string, dd2: string}}
export type TPostHistoryTaskLogTickets = {kind: 'history-task-log-tickets', token: string, data?: {task: string, dd: string}}
export type TPostHistoryTaskLogFileDownload = {kind: 'history-task-log-file-download', token: string, data?: {kind: 'ticket' | 'row' | 'msg', task: string, dd: string, tiketFileName: string, idxs: string}}

export type TPost = TPostSignin | TPostConnection | TPostEditLoad |  TPostEditDelete | TPostEditChange |
    TPostHistoryServiceLog | TPostHistoryServiceLogItem | TPostHistoryServiceLogItemDownload |
    TPostHistoryTaskLog | TPostHistoryTaskLogTickets | TPostHistoryTaskLogFileDownload

export type TReplyUnknown = {kind: 'unknown'}
export type TReplySignin = {kind: 'signin', data?: {token: string}}
export type TReplyConnection = {kind: 'test-connection', data?: {mssqls: TDepotMssql[], errors: string[], infos: TServerInfo[] }}
export type TReplyEditLoad = {kind: 'edit-load', data?: {mssqls: TDepotMssql[], tasks: TDepotTask[]}}
export type TReplyEditDelete = {kind: 'edit-delete'}
export type TReplyEditChange = {kind: 'edit-change'}
export type TReplyHistoryServiceLog = {kind: 'history-service-log', data?: {days: apiServiceLog.TFileHistoryServiceLog[]}}
export type TReplyHistoryServiceLogItem = {kind: 'history-service-log-item', data?: {text: string}}
export type TReplyHistoryServiceLogItemDownload = {kind: 'history-service-log-item-download'}
export type TReplyHistoryTaskLog = {kind: 'history-task-log', data?: {tasks: apiTaskLog.TFileHistoryTaskLog[]}}
export type TReplyHistoryTaskLogTickets = {kind: 'history-task-log-tickets', data?: {tickets: apiTaskLog.TFileHistoryTaskLogTickets[]}}
export type TReplyHistoryTaskLogFileDownload  = {kind: 'history-task-log-file-download'}

export type TReply = {error?: string} & (
    TReplyUnknown | TReplySignin | TReplyConnection | TReplyEditLoad | TReplyEditDelete | TReplyEditChange |
    TReplyHistoryServiceLog | TReplyHistoryServiceLogItem | TReplyHistoryServiceLogItemDownload |
    TReplyHistoryTaskLog | TReplyHistoryTaskLogTickets | TReplyHistoryTaskLogFileDownload
    )
export type TReplyBox = {statusCode: number, reply: TReply}

export function Go() {
    if (!env.options.manage.allowApi) return

    const httpGate = CreateHttpGate({url: env.options.manage.http})
    httpGate.onError(error => {
        env.logger.errorExt('API', error)
    })
    httpGate.onRequest(request => {
        const traceKey = env.options.log.allowTrace === true ? vv.guid().replace(/-/g,'').concat(vv.dateFormat(new Date(), 'ssmsec')) : ''

        if (request.method === 'GET') {
            vv.dir(path.join('..', __dirname), {deep: 3, mode: 'all'}, (error, result) => {
                result.forEach(r => {
                    console.log(`${r.path} -> ${r.file}`)
                })
            })
            //console.log('not yet')
            return
        }
        if (request.method === 'POST') {
            env.logger.traceExt('api', `request #${traceKey}`, request.data)

            let post: TPost = undefined
            try {
                post = JSON.parse(request.data)
            } catch (error) {
                sendReplyBox (request, traceKey, {
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
                sendReplyBox (request, traceKey, {
                    statusCode: 403,
                    reply: {
                        kind: post?.kind,
                        error: denyAccess
                    }
                })
                return
            }

            if (post?.kind === 'signin') {
                sendReplyBox(request, traceKey, apiSecurity.CreateToken(post?.data?.password))
                return
            }

            if (post?.kind === 'test-connection') {
                apiTestConnection.Test(post, replyBox => {
                    sendReplyBox(request, traceKey, replyBox)
                })
                return
            }

            if (post?.kind === 'edit-load') {
                apiEdit.Load(replyBox => {
                    sendReplyBox(request, traceKey, replyBox)
                })
                return
            }

            if (post?.kind === 'edit-delete') {
                apiEdit.Delete(post, replyBox => {
                    sendReplyBox(request, traceKey, replyBox)
                })
                return
            }

            if (post?.kind === 'edit-change') {
                apiEdit.Change(post, replyBox => {
                    sendReplyBox(request, traceKey, replyBox)
                })
                return
            }

            if (post?.kind === 'history-service-log') {
                apiServiceLog.LoadList(post, replyBox => {
                    sendReplyBox(request, traceKey, replyBox)
                })
                return
            }

            if (post?.kind === 'history-service-log-item') {
                apiServiceLog.LoadText(post, replyBox => {
                    sendReplyBox(request, traceKey, replyBox)
                })
                return
            }

            if (post?.kind === 'history-service-log-item-download') {
                const fullFileName = apiServiceLog.GetLogFullFileName(post.data?.dd, post.data?.kind)
                sendReplyFile(request, traceKey, fullFileName, post.kind)
                return
            }

            if (post?.kind === 'history-task-log') {
                apiTaskLog.LoadTaskList(post, replyBox => {
                    sendReplyBox(request, traceKey, replyBox)
                })
                return
            }

            if (post?.kind === 'history-task-log-tickets') {
                apiTaskLog.LoadTickets(post, replyBox => {
                    sendReplyBox(request, traceKey, replyBox)
                })
                return
            }

            if (post?.kind === 'history-task-log-file-download') {
                let filePath = path.join(env.options.task.path, post.data?.dd || 'XXX', post.data?.task || 'XXX')
                let fileName = post.data?.tiketFileName || 'XXX'
                if (post.data?.idxs) {
                    fileName = path.parse(fileName).name.concat('.', post.data?.idxs, path.parse(fileName).ext)
                }
                if (post.data?.kind === 'row') {
                    filePath = path.join(filePath, 'row')
                    fileName = 'r.'.concat(fileName.substring(2, fileName.length))
                } else if (post.data?.kind === 'msg') {
                    filePath = path.join(filePath, 'msg')
                    fileName = 'm.'.concat(fileName.substring(2, fileName.length))
                }
                const fullFileName = path.join(filePath, fileName)
                sendReplyFile(request, traceKey, fullFileName, post.kind)
                return
            }

            sendReplyBox (request, traceKey, {
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
            env.logger.debugExt('api', `start at http://${addr.url}:${addr.port}`)
        }
    })
}

function sendReplyBox(request: TRequest, traceKey: string, replyBox: TReplyBox): void {
    request.replySetHeader('content-type', 'application/json; charset=UTF-8')
    env.logger.traceExt('api', `reply #${traceKey} begin`)
    if (replyBox && replyBox.statusCode) {
        request.reply(replyBox.statusCode, replyBox.reply, () => {
            env.logger.traceExt('api', `reply #${traceKey} end`, replyBox)
        })
    } else {
        request.reply(500, {kind: 'unknown', error: 'unknown post data'} as TReply, () => {
            env.logger.traceExt('api', `reply #${traceKey} end`, replyBox)
        })
    }
}

function sendReplyFile(request: TRequest, traceKey: string, fullFileName: string, kind: string): void {
    if (!fullFileName) {
        sendReplyBox(request, traceKey, {
            statusCode: 400,
            reply: {
                kind: kind as any,
                error: `cant't create file name from input params`
            }
        })
        return
    }
    request.replyFile({fullFileName: fullFileName}, error => {
        if (error) {
            sendReplyBox(request, traceKey, {
                statusCode: 500,
                reply: {
                    kind: kind as any,
                    error: error.message
                }
            })
        } else {
            env.logger.traceExt('api', `reply #${traceKey} file`, fullFileName)
        }
    })
}

