import { env } from '../app'
//import { TPost, TReplyBox } from './index'
import { Create as CreateJwtManager } from 'vv-jwt'

//type TPostAccessLevel = 'edit' | 'view'
//type TPostAccessLevelCheck = {kind: string, level: TPostAccessLevel}

const jwtManager = CreateJwtManager({
    secret: 'mssqltask-app-secret',
    issDefault: 'mssqltask-app',
    expDelta: 1000 * 60 * 60 * 24,   //create tokens with one day life
})

export function CreateToken(password: string): {token?: string, error?: string} {
    let accessLevel: string = undefined
    if (env.options.manage.passwordEdit === password) {
        accessLevel = 'edit'
    } else if (env.options.manage.passwordView === password) {
        accessLevel = 'view'
    }
    if (!accessLevel) {
        return {error: 'incorrect password'}
    }
    const jwt = jwtManager.create({additional:{accessLevel: accessLevel}})
    if (jwt.error) {
        return {error: `in generate token: ${jwt.error.message}`}
    } else {
        return {token: jwt.jwtString}
    }
}

// export function CheckToken(post: TPost): string {
//     if (!post || !post.kind) {
//         return `Incorrect password request`
//     }

//     const needAccessLevel = postAccessLevelCheck.find(f => f.kind === post.kind)?.level
//     if (!needAccessLevel) return undefined

//     const defaultAccessLevel = !env.options.manage.passwordEdit ? 'edit' : !env.options.manage.passwordView ? 'view' : undefined
//     if (compareAccessLevel(needAccessLevel, defaultAccessLevel)) return undefined
//     if (defaultAccessLevel === 'edit' && needAccessLevel === 'view') return undefined

//     const check = jwtManager.check(post['token'])
//     if (check.deny) {
//         return check.deny.message
//     }

//     const accessLevel = (check.jwt?.additional as any)?.accessLevel
//     if (!accessLevel) {
//         return `empty access level in token`
//     }

//     if (compareAccessLevel(needAccessLevel, accessLevel)) return undefined
//     return `token has poor access level`
// }

// function compareAccessLevel(need:  TPostAccessLevel, available: TPostAccessLevel): boolean {
//     return (need === available || (need === 'view' && available === 'edit'))
// }