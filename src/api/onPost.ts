import * as vv from 'vv-common'
import { TRequest } from "vv-httpgate"
import { env } from './../app'
import * as security from './onPostSecurity'

export enum EPostKind {
    signin,
    depotLoad,
    depotSave
}

export type TPostSignin = {kind: EPostKind.signin, data: {password: string}}
export type TReplySignin = {kind: EPostKind.signin, data: {token: string}}

export type TPost = TPostSignin
export type TReply = TReplySignin

export function Handler(request: TRequest) {

    const sender = new Sender(request)
    if (sender.postData === undefined) return

    if (sender.postData.kind === EPostKind.signin) {
        const jwt = security.CreateToken(sender.postData.data.password)
        if (jwt.error) {
            sender.reply(403, jwt.error)
        } else {
            sender.reply(200, {kind: sender.postData.kind, data: {token: jwt.token}} as TReplySignin)
        }
        return
    }

}

class Sender {
    private _request: TRequest
    private _traceKey: string
    public postData: TPost

    constructor(request: TRequest) {
        this._request = request
        this._traceKey = env.options.log.allowTrace === true ? vv.guid().replace(/-/g,'').concat(vv.dateFormat(new Date(), 'ssmsec')) : 'n/a'
        env.logger.traceExt('api', `reply #${this._traceKey} start`)
        try {
            this.postData = JSON.parse(request.data)
        } catch (error) {
            request.reply(500, `in json parse data - ${(error as Error).message}`)
            env.logger.errorExt('api', `reply #${this._traceKey} error json parse - ${(error as Error).message}`)
        }
    }

    reply(statusCode: number, message: TReply | string) {
        this._request.replySetHeader('content-type', 'application/json; charset=UTF-8')
        this._request.reply(statusCode, message, error => {
            if (error) {
                env.logger.errorExt('api', `in reply #${this._traceKey} ${error.message}`)
            } else {
                env.logger.traceExt('api', `reply #${this._traceKey} stop`, {statusCode, message})
            }
        })
    }
}