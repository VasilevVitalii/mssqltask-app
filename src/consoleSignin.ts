import { TRequest } from 'vv-httpgate'
import { env } from './app'
import { TPostSignin, TReplySignin } from './console'
import { Create as CreateJwtManager } from 'vv-jwt'

const jwtManager = CreateJwtManager({
    secret: 'mssqltask-app-secret',
    issDefault: 'mssqltask-app',
    expDelta: 1000 * 60 * 60 * 24,   //create tokens with one day life
})

export function Create(request: TRequest, data: TPostSignin): void {
    if (!data || !data.data) {
        request.reply(403, `Incorrect password request`)
        return
    }
    let accessLevel: string = undefined
    if (env.options.console.passwordEdit === data.data.password) {
        accessLevel = 'edit'
    } else if (env.options.console.passwordView === data.data.password) {
        accessLevel = 'view'
    }
    if (!accessLevel) {
        request.reply(403, `Incorrect password`)
        return
    }
    const jwt = jwtManager.create({additional:{accessLevel: accessLevel}})
    if (jwt.error) {
        request.reply(403, `Error generate token: ${jwt.error.message}`)
        return
    }
    request.replySetHeader('content-type', 'application/json; charset=UTF-8')
    request.reply(200, {kind: 'signin', data: {token: jwt.jwtString}} as TReplySignin)
}

export function Check(request: TRequest, token: string, needAccessLevel: 'edit' | 'view'): boolean {
    const defaultAccessLevel = !env.options.console.passwordEdit ? 'edit' : !env.options.console.passwordView ? 'view' : undefined
    if (compareAccessLevel(needAccessLevel, defaultAccessLevel)) return true
    if (defaultAccessLevel === 'edit' && needAccessLevel === 'view') return true
    const check = jwtManager.check(token)
    if (check.deny) {
        request.reply(403, check.deny.message)
    }
    const accessLevel = (check.jwt?.additional as any)?.accessLevel
    if (!accessLevel) {
        request.reply(403, `empty access level in token`)
    }
    if (compareAccessLevel(needAccessLevel, accessLevel)) return true
    request.reply(403, `token has poor access level`)
    return false
}

function compareAccessLevel(need:  'edit' | 'view', available: 'edit' | 'view'): boolean {
    return (need === available || (need === 'view' && available === 'edit'))
}