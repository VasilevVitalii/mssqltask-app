import path from 'path'
import * as vv from 'vv-common'
import { env } from '../app'
import { HelperContent, TRequest } from 'vv-httpgate'

type TUi = {path: string, data: any, errorRead: string, contentType: string}

let ui: TUi[] = undefined

export function Prepare() {
    const p = path.join(__dirname, '..', 'ui')
    vv.dir(p, {mode: 'files'}, (error, result) => {
        if (error) {
            env.logger.errorExt('api', `in load ui to cache "${error.message}"`)
            return
        }
        vv.readFiles(result.map(m => { return path.join(m.path, m.file) }), {encoding: 'base64'}, files => {
            const result: TUi[] = files.map(m => {return {
                path: m.fullFileName.substring(p.length, m.fullFileName.length).replace(/\\/g, '/'),
                data: m.data,
                errorRead: m.errorRead,
                contentType: undefined
            }})
            result.forEach(r => {
                if (r.errorRead) {
                    env.logger.errorExt('api', `in load file "${r.path}" = "${r.errorRead}"`)
                    return
                }
                const content = HelperContent(r.data, path.parse(r.path).ext)
                if (!content) {
                    const errorContent = `unknown content for "${r.path}"`
                    r.errorRead = errorContent
                    env.logger.errorExt('api', errorContent)
                    return
                }
                r.data = content.content
                r.contentType = content.type
            })
            ui = result
        })
    })
}

export function Handler(request: TRequest) {
    if (!env.options.manage.allowUi) {
        request.reply(500, `ui disabled`)
        return
    }
    if (!ui) {
        request.reply(500, `ui not loaded yet, please try again later`)
        return
    }
    const fndPath = request.path === '/' ? '/index.html' : request.path
    const fnd = ui.find(f => vv.equal(f.path, fndPath))
    if (!fnd) {
        request.reply(500, `resource "${request.path}" not found`)
        return
    }
    if (fnd.errorRead) {
        request.reply(500, `resource "${request.path}" loaded with error`)
        return
    }
    if (fnd.contentType) {
        request.replySetHeader('Content-Type', fnd.contentType)
    }
    request.reply(200, fnd.data)

}

