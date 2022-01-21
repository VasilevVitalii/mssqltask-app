import * as vv from 'vv-common'
import { TRequest } from "vv-httpgate"
import { env } from './../app'
import { Create as CreateJwtManager } from 'vv-jwt'
import { TDepotMssql } from './../depotMssql'
import { TDepotTask } from './../depotTask'

import { OnPostDepotLoad, OnPostDepotSave } from './onPostDepot'

export enum EPostKind {
    signin,
    depotLoad,
    depotSave,
    historyServiceLog,
}

export type TPostSignin = {kind: EPostKind.signin, password: string}
export type TReplySignin = {token: string}

export type TPostDepotLoad = {kind: EPostKind.depotLoad, token: string}
export type TReplyDepotLoad = {mssqls: TDepotMssql[], tasks: TDepotTask[]}

export type TPostDepotSave = {kind: EPostKind.depotSave, token: string, delete: {mssqls: {path: string, file: string}[], tasks: {path: string, file: string}[]}, upsert: {mssqls: TDepotMssql[], tasks: TDepotTask[]}}
export type TReplyDepotSave = TReplyDepotLoad

export type THistoryServiceLogType = 'trace' | 'debug' | 'error'
export type TPostHistoryServiceLog = {kind: EPostKind.historyServiceLog, token: string, d1: string, d2: string}
export type TReplyHistoryServiceLog = {items: {type: THistoryServiceLogType, fileName: string, }}

export type TPost = TPostSignin | TPostDepotLoad | TPostDepotSave
export type TReply = TReplySignin | TReplyDepotLoad | TReplyDepotSave

//export type TFileHistoryServiceLog = {dd: string, sizeError: number | undefined, sizeDebug: number | undefined, sizeTrace: number | undefined}

const jwtManager = CreateJwtManager({
    secret: 'mssqltask-app-secret',
    issDefault: 'mssqltask-app',
    expDelta: 1000 * 60 * 60 * 24,   //create tokens with one day life
})

type TAccessLevel = 'edit' | 'view'
type THandlerRule = {kind: EPostKind, level: TAccessLevel, handler: (requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) => void}
const handlerRules: THandlerRule[] = [
    {kind: EPostKind.signin, level: undefined, handler: onSignin },
    {kind: EPostKind.depotLoad, level: 'view', handler: OnPostDepotLoad },
    {kind: EPostKind.depotSave, level: 'edit', handler: OnPostDepotSave }
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
    const deny = checkToken(requestData, handlerRule.level)
    if (deny) {
        send(request, traceKey, 403, deny)
        return
    }

    try {
        handlerRule.handler(requestData, (statusCode, message) => {
            send(request, traceKey, statusCode, message)
        })
    } catch (error) {
        send(request, traceKey, 500, (error as Error).message)
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

function checkToken(post: TPost, needAccessLevel: TAccessLevel): string {
    if (!needAccessLevel) {
        return undefined
    }
    const token = (post as any)?.data?.token as string
    if (!token) {
        return 'token is empty'
    }
    const check = jwtManager.check((post as any)?.data?.token)
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