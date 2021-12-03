import { env } from './app'
import { Create as CreateHttpGate, TRequest } from 'vv-httpgate'
import * as consoleSignin from './consoleSignin'
import * as consoleEdit from './consoleEdit'
import { TDepotMssql } from './depotMssql'
import { TDepotTask } from './depotTask'

export type TPostSignin = {kind: 'signin', data: {password: string}}
export type TPostEditLoad = {kind: 'edit-load', token: string}
export type TPost = TPostSignin | TPostEditLoad

export type TReplySignin = {kind: 'signin', data: {token: string}}
export type TReplyEditLoad = {kind: 'edit-load', data: {mssqls: {path: string, file: string, data: TDepotMssql}[], tasks: {path: string, file: string, data: TDepotTask}[]}}

export function Go() {
    if (!env.options.console.allowApi) return

    const httpGate = CreateHttpGate({url: env.options.console.http})
    httpGate.onError(error => {
        env.logger.error('CONSOLE', error)
    })
    httpGate.onRequest(request => {
        if (request.method === 'GET') {
            console.log('not yet')
            return
        }
        if (request.method === 'POST') {
            const post = getPost(request)
            if (!post) return
            if (post.kind === 'signin') {
                consoleSignin.Create(request, post)
            } else if (post.kind === 'edit-load') {
                if (!consoleSignin.Check(request, post.token, 'edit')) return
                consoleEdit.Load(request)
            } else {
                request.reply(400, `unknown kind "${post['kind']}"`)
            }

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
            env.logger.debug(`CONSOLE - start at http://${addr.url}:${addr.port}`)
        }
    })
}

function getPost(request: TRequest): TPost {
    let data: TPost = undefined
    try {
        data = JSON.parse(request.data)
    } catch (error) {
        request.reply(400, `error convert string data to json: ${(error as Error).message}`)
        return undefined
    }
    return data
}