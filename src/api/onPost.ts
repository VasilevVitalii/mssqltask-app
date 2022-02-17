import * as vv from 'vv-common'
import { TRequest } from "vv-httpgate"
import { Create as CreateJwtManager } from 'vv-jwt'
import { TTicketResult, TTicketResultServer } from 'mssqltask'

import { env } from './../app'
import { TDepotMssql } from './../depotMssql'
import { TDepotTask } from './../depotTask'
import { OnPostDepotLoad, OnPostDepotSave, OnPostDepotTestConnection } from './onPostDepot'
import { OnPostHistoryServiceList, OnPostHistoryServiceItemDownload, OnPostHistoryServiceItemView } from './onPostHistoryService'
import { OnPostHistoryTaskList, OnPostHistoryTaskDay, OnPostHistoryTaskItemView, OnPostHistoryTaskItemDownload } from './onPostHistoryTask'

export type TFileMode = 'view' | 'download'

export type TPostSignin = {kind: 'signin', password: string}
export type TReplySignin = {token: string}

export type TPostDepotLoad = {kind: 'depotLoad', token: string}
export type TReplyDepotLoad = {mssqls: TDepotMssql[], tasks: TDepotTask[]}

export type TPostDepotSave = {kind: 'depotSave', token: string, delete: {mssqls: {path: string, file: string}[], tasks: {path: string, file: string}[]}, upsert: {mssqls: TDepotMssql[], tasks: TDepotTask[]}}
export type TReplyDepotSave = TReplyDepotLoad

export type TPostDepotTestConnection = {kind: 'depotTestConnection', token: string, instance: string, login: string, password: string, passwordFromDepot?: {path: string , file: string}}
// eslint-disable-next-line @typescript-eslint/naming-convention
export type TReplyDepotTestConnection = {instance: string, login: string, result: boolean, resultText: string}

export type THistoryServiceItemType = 'trace' | 'debug' | 'error'
export type TPostHistoryServiceList = {kind: 'historyServiceList', token: string, d1: string, d2: string}
export type TReplyHistoryServiceList = {files: {type: THistoryServiceItemType, d: string, file: string, size: number}[]}

export type TPostHistoryServiceItemView = {kind: 'historyServiceItemView', token: string, file: string }
export type TReplyHistoryServiceItemView = {text: string}

export type TPostHistoryServiceItemDownload = {kind: 'historyServiceItemDownload', token: string, file: string }

export type TPostHistoryTaskList = {kind: 'historyTaskList', token: string, d1: string, d2: string }
export type TReplyHistoryTaskList = {map: {d: string, task: string}[]}

export type TReplyHistoryTaskDayDataServer = TTicketResultServer & {title: string}
export type TReplyHistoryTaskDayData = TTicketResult & {servers: TReplyHistoryTaskDayDataServer[]}
export type TPostHistoryTaskDay = {kind: 'historyTaskDay', token: string, d: string, task: string }
export type TReplyHistoryTaskDay = {files: {path: string, file: string, data: TReplyHistoryTaskDayData}[]}

export type THistoryTaskItemType = 'ticket' | 'row' | 'msg'
export type TPostHistoryTaskItemView = {kind: 'historyTaskItemView', token: string, type: THistoryTaskItemType, pathTicket: string, fileTicket: string, serverIdxs: string }
export type TReplyHistoryTaskItemView = {text: string}

export type TPostHistoryTaskItemDownload = {kind: 'historyTaskItemDownload', token: string, type: THistoryTaskItemType, pathTicket: string, fileTicket: string, serverIdxs: string }

export type TPost = TPostSignin | TPostDepotLoad | TPostDepotSave | TPostDepotTestConnection | TPostHistoryServiceList | TPostHistoryServiceItemView | TPostHistoryServiceItemDownload | TPostHistoryTaskList | TPostHistoryTaskDay | TPostHistoryTaskItemView | TPostHistoryTaskItemDownload
export type TReply = TReplySignin | TReplyDepotLoad | TReplyDepotSave | TReplyDepotTestConnection | TReplyHistoryServiceList | TReplyHistoryServiceItemView | TReplyHistoryTaskList | TReplyHistoryTaskDay | TReplyHistoryTaskItemView

const jwtManager = CreateJwtManager({
    secret: 'mssqltask-app-secret',
    issDefault: 'mssqltask-app',
    expDelta: 1000 * 60 * 60 * 24,   //create tokens with one day life
})

type TAccessLevel = 'edit' | 'view'
type THandlerRule = {
    kind: string,
    level: TAccessLevel,
    handler: (requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) => void,
    handlerDownload: (requestData: TPost, callback: (fillFileName: string) => void) => void,
}
const handlerRules: THandlerRule[] = [
    {kind: 'signin', level: undefined, handler: onSignin, handlerDownload: undefined },
    {kind: 'depotLoad', level: 'view', handler: OnPostDepotLoad, handlerDownload: undefined },
    {kind: 'depotSave', level: 'edit', handler: OnPostDepotSave, handlerDownload: undefined },
    {kind: 'depotTestConnection', level: 'edit', handler: OnPostDepotTestConnection, handlerDownload: undefined },
    {kind: 'historyServiceList', level: 'view', handler: OnPostHistoryServiceList, handlerDownload: undefined },
    {kind: 'historyServiceItemView', level: 'view', handler: OnPostHistoryServiceItemView, handlerDownload: undefined },
    {kind: 'historyServiceItemDownload', level: 'view', handler: undefined, handlerDownload: OnPostHistoryServiceItemDownload },
    {kind: 'historyTaskList', level: 'view', handler: OnPostHistoryTaskList, handlerDownload: undefined },
    {kind: 'historyTaskDay', level: 'view', handler: OnPostHistoryTaskDay, handlerDownload: undefined },
    {kind: 'historyTaskItemView', level: 'view', handler: OnPostHistoryTaskItemView, handlerDownload: undefined },
    {kind: 'historyTaskItemDownload', level: 'view', handler: undefined, handlerDownload: OnPostHistoryTaskItemDownload },
]

export function Handler(request: TRequest) {
    const traceKey = env.options.log.allowTrace === true ? vv.guid().replace(/-/g,'').concat(vv.dateFormat(new Date(), 'ssmsec')) : 'n/a'
    env.logger.traceExt('api', `reply #${traceKey} start`)
    let requestData: TPost = undefined
    try {
        requestData = JSON.parse(request.data)
    } catch (error) {
        send(request, traceKey, 500, `in json parse data - ${(error as Error).message}`)
        return
    }

    const handlerRule = handlerRules.find(f => f.kind === requestData.kind)
    if (!handlerRule) {
        send(request, traceKey, 500, `unknown kind = ${requestData.kind}`)
        return
    }
    const denyText = checkToken(requestData, handlerRule.level)
    if (denyText) {
        send(request, traceKey, 403, denyText)
        return
    }
    if (!handlerRule.handler && !handlerRule.handlerDownload) {
        send(request, traceKey, 500, `kind = ${requestData.kind} has empty handler`)
        return
    }

    if (handlerRule.handler) {
        try {
            handlerRule.handler(requestData, (statusCode, message) => {
                send(request, traceKey, statusCode, message)
            })
        } catch (error) {
            send(request, traceKey, 500, (error as Error).message)
        }
    }
    if (handlerRule.handlerDownload) {
        try {
            handlerRule.handlerDownload(requestData, fullFileName => {
                sendFile(request, traceKey, fullFileName)
            })
        } catch (error) {
            send(request, traceKey, 500, (error as Error).message)
        }
    }


}

function send(request: TRequest, traceKey: string, statusCode: number, message: TReply | string) {
    request.replySetHeader('content-type', 'application/json; charset=UTF-8')
    request.reply(statusCode, message, error => {
        if (error) {
            env.logger.errorExt('api', `in reply #${traceKey} ${error.message}`)
        } else {
            env.logger.traceExt('api', `reply #${traceKey} stop`, {statusCode, message})
        }
    })
}

function sendFile(request: TRequest, traceKey: string, fullFileName: string) {
    request.replyFile({fullFileName: fullFileName}, error => {
        if (error) {
            env.logger.errorExt('api', `in reply #${traceKey} ${error.message}`)
        } else {
            env.logger.traceExt('api', `reply #${traceKey} stop, file ${fullFileName}`)
        }
    })
}

function checkToken(post: TPost, needAccessLevel: TAccessLevel): string {
    if (!needAccessLevel) {
        return undefined
    }
    const token = (post as any)?.token as string
    if (!token) {
        return 'token is empty'
    }
    const check = jwtManager.check(token)
    if (check.deny) {
        return check.deny.message
    }

    const accessLevel = (check.jwt?.additional as any)?.accessLevel as TAccessLevel
    if (!accessLevel) {
        return `empty access level in token`
    }

    if (needAccessLevel === 'edit' && accessLevel === 'view') {
        return `token has poor access level`
    }

    return undefined
}

function onSignin(requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) {
    const rd = requestData as TPostSignin
    let accessLevel: TAccessLevel = undefined
    if (env.options.manage.passwordEdit === rd.password) {
        accessLevel = 'edit'
    } else if (env.options.manage.passwordView === rd.password) {
        accessLevel = 'view'
    }
    if (!accessLevel) {
        callback(403, 'incorrect password')
        return
    }
    const jwt = jwtManager.create({additional:{accessLevel: accessLevel}})
    if (jwt.error) {
        callback(403, `in generate token: ${jwt.error.message}`)
        return
    } else {
        callback(200, {token: jwt.jwtString} as TReplySignin)
    }
}