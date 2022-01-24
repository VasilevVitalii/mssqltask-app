import * as vv from 'vv-common'
import { TRequest } from "vv-httpgate"
import { Create as CreateJwtManager } from 'vv-jwt'
import { TTicketResult } from 'mssqltask'

import { env } from './../app'
import { TDepotMssql } from './../depotMssql'
import { TDepotTask } from './../depotTask'
import { OnPostDepotLoad, OnPostDepotSave } from './onPostDepot'
import { OnPostHistoryServiceList, OnPostHistoryServiceItemDownload, OnPostHistoryServiceItemView } from './onPostHistoryService'
import { OnPostHistoryTaskList } from './onPostHistoryTask'

export enum EPostKind {
    signin = 'signin',
    depotLoad = 'depotLoad',
    depotSave = 'depotSave',
    historyServiceList = 'historyServiceList',
    historyServiceItemView = 'historyServiceItemView',
    historyServiceItemDownload = 'historyServiceItemDownload',
    historyTaskList = 'historyTaskList',
    historyTaskDay = 'historyTaskDay',
    //historyTaskItemDownload = 'historyTaskItemDownload',
}

export type TFileMode = 'view' | 'download'

export type TPostSignin = {kind: EPostKind.signin, password: string}
export type TReplySignin = {token: string}

export type TPostDepotLoad = {kind: EPostKind.depotLoad, token: string}
export type TReplyDepotLoad = {mssqls: TDepotMssql[], tasks: TDepotTask[]}

export type TPostDepotSave = {kind: EPostKind.depotSave, token: string, delete: {mssqls: {path: string, file: string}[], tasks: {path: string, file: string}[]}, upsert: {mssqls: TDepotMssql[], tasks: TDepotTask[]}}
export type TReplyDepotSave = TReplyDepotLoad

export type THistoryServiceItemType = 'trace' | 'debug' | 'error'
export type TPostHistoryServiceList = {kind: EPostKind.historyServiceList, token: string, d1: string, d2: string}
export type TReplyHistoryServiceList = {items: {type: THistoryServiceItemType, d: string, fileName: string, size: number}[]}

export type TPostHistoryServiceItemView = {kind: EPostKind.historyServiceItemView, token: string, fileName: string }
export type TReplyHistoryServiceItemView = {text: string}

export type TPostHistoryServiceItemDownload = {kind: EPostKind.historyServiceItemDownload, token: string, fileName: string }

export type TPostHistoryTaskList = {kind: EPostKind.historyTaskList, token: string, d1: string, d2: string }
export type TReplyHistoryTaskList = {items: {d: string, task: string}[]}

export type TPostHistoryTaskDay = {kind: EPostKind.historyTaskList, token: string, d: string, task: string }
export type TReplyHistoryTaskDay = {items: {ticketFile: string, ticketData: TTicketResult}[]}

export type TPost = TPostSignin | TPostDepotLoad | TPostDepotSave | TPostHistoryServiceList | TPostHistoryServiceItemView | TPostHistoryServiceItemDownload | TPostHistoryTaskList
export type TReply = TReplySignin | TReplyDepotLoad | TReplyDepotSave | TReplyHistoryServiceList | TReplyHistoryServiceItemView | TReplyHistoryTaskList

const jwtManager = CreateJwtManager({
    secret: 'mssqltask-app-secret',
    issDefault: 'mssqltask-app',
    expDelta: 1000 * 60 * 60 * 24,   //create tokens with one day life
})

type TAccessLevel = 'edit' | 'view'
type THandlerRule = {
    kind: EPostKind,
    level: TAccessLevel,
    handler: (requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) => void,
    handlerDownload: (requestData: TPost, callback: (fillFileName: string) => void) => void,
}
const handlerRules: THandlerRule[] = [
    {kind: EPostKind.signin, level: undefined, handler: onSignin, handlerDownload: undefined },
    {kind: EPostKind.depotLoad, level: 'view', handler: OnPostDepotLoad, handlerDownload: undefined },
    {kind: EPostKind.depotSave, level: 'edit', handler: OnPostDepotSave, handlerDownload: undefined },
    {kind: EPostKind.historyServiceList, level: 'view', handler: OnPostHistoryServiceList, handlerDownload: undefined },
    {kind: EPostKind.historyServiceItemView, level: 'view', handler: OnPostHistoryServiceItemView, handlerDownload: undefined },
    {kind: EPostKind.historyServiceItemDownload, level: 'view', handler: undefined, handlerDownload: OnPostHistoryServiceItemDownload },
    {kind: EPostKind.historyTaskList, level: 'view', handler: OnPostHistoryTaskList, handlerDownload: undefined },
    {kind: EPostKind.historyTaskDay, level: 'view', handler: undefined, handlerDownload: undefined },
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
    const deny = checkToken(requestData, handlerRule.level)
    if (deny) {
        send(request, traceKey, 403, deny)
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