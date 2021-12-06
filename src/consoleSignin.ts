import { env } from './app'
import { TPost, TReplyBox, TReplySignin } from './console'
import { Create as CreateJwtManager } from 'vv-jwt'

type TPostAccessLevel = 'edit' | 'view'
type TPostAccessLevelCheck = {kind: string, level: TPostAccessLevel}

const jwtManager = CreateJwtManager({
    secret: 'mssqltask-app-secret',
    issDefault: 'mssqltask-app',
    expDelta: 1000 * 60 * 60 * 24,   //create tokens with one day life
})

const postAccessLevelCheck: TPostAccessLevelCheck[] = [
    {kind: 'edit-load', level: 'view'}
]

export function Create(password: string): TReplyBox {
    let accessLevel: string = undefined
    if (env.options.console.passwordEdit === password) {
        accessLevel = 'edit'
    } else if (env.options.console.passwordView === password) {
        accessLevel = 'view'
    }
    if (!accessLevel) {
        return {
            statusCode: 403,
            reply: {
                kind: 'signin',
                error: `Incorrect password`
            }
        }
    }
    const jwt = jwtManager.create({additional:{accessLevel: accessLevel}})
    if (jwt.error) {
        return {
            statusCode: 500,
            reply: {
                kind: 'signin',
                error: `Error generate token: ${jwt.error.message}`
            }
        }
    }

    return {
        statusCode: 200,
        reply: {
            kind: 'signin',
            data: {
                token: jwt.jwtString
            }
        }
    }
}

export function Check(post: TPost): string {
    if (!post || !post.kind) {
        return `Incorrect password request`
    }

    const needAccessLevel = postAccessLevelCheck.find(f => f.kind === post.kind)?.level
    if (!needAccessLevel) return undefined

    const defaultAccessLevel = !env.options.console.passwordEdit ? 'edit' : !env.options.console.passwordView ? 'view' : undefined
    if (compareAccessLevel(needAccessLevel, defaultAccessLevel)) return undefined
    if (defaultAccessLevel === 'edit' && needAccessLevel === 'view') return undefined

    const check = jwtManager.check(post['token'])
    if (check.deny) {
        return check.deny.message
    }

    const accessLevel = (check.jwt?.additional as any)?.accessLevel
    if (!accessLevel) {
        return `empty access level in token`
    }

    if (compareAccessLevel(needAccessLevel, accessLevel)) return undefined
    return `token has poor access level`
}

function compareAccessLevel(need:  TPostAccessLevel, available: TPostAccessLevel): boolean {
    return (need === available || (need === 'view' && available === 'edit'))
}