import { env } from './app'
import { TReplyBox, TReplySignin } from './console'
import { Create as CreateJwtManager } from 'vv-jwt'

const jwtManager = CreateJwtManager({
    secret: 'mssqltask-app-secret',
    issDefault: 'mssqltask-app',
    expDelta: 1000 * 60 * 60 * 24,   //create tokens with one day life
})

export function Create(replyBox: TReplyBox, password: string): void {
    // if (!data || !data.data) {
    //     replyBox.statusCode = 403
    //     replyBox.reply.error = `Incorrect password request`
    //     return
    // }
    let accessLevel: string = undefined
    if (env.options.console.passwordEdit === password) {
        accessLevel = 'edit'
    } else if (env.options.console.passwordView === password) {
        accessLevel = 'view'
    }
    if (!accessLevel) {
        replyBox.statusCode = 403
        replyBox.reply.error = `Incorrect password`
        return
    }
    const jwt = jwtManager.create({additional:{accessLevel: accessLevel}})
    if (jwt.error) {
        replyBox.statusCode = 500
        replyBox.reply.error = `Error generate token: ${jwt.error.message}`
        return
    }

    replyBox.statusCode = 200
    replyBox.reply: TReplySignin = {
        
    }   // .data = {token: jwt.jwtString}
}

export function Check(token: string, needAccessLevel: 'edit' | 'view'): string {
    const defaultAccessLevel = !env.options.console.passwordEdit ? 'edit' : !env.options.console.passwordView ? 'view' : undefined
    if (compareAccessLevel(needAccessLevel, defaultAccessLevel)) return undefined
    if (defaultAccessLevel === 'edit' && needAccessLevel === 'view') return undefined
    const check = jwtManager.check(token)
    if (check.deny) {
        return check.deny.message
    }
    const accessLevel = (check.jwt?.additional as any)?.accessLevel
    if (!accessLevel) {
        return `empty access level in token`
    }
    if (compareAccessLevel(needAccessLevel, accessLevel)) return ''
    return `token has poor access level`
}

function compareAccessLevel(need:  'edit' | 'view', available: 'edit' | 'view'): boolean {
    return (need === available || (need === 'view' && available === 'edit'))
}