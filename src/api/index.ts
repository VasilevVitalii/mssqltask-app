import { env } from './../app'
import { Create as CreateHttpGate } from 'vv-httpgate'
import * as onGet from './onGet'
import * as onPost from './onPost'
import * as onServerEvent from './onServerEvent'

export function Go() {
    if (!env.options.manage.allowApi) return
    if (env.options.manage.allowUi) onGet.Prepare()

    const httpGate = CreateHttpGate({url: env.options.manage.http})

    httpGate.onError(error => {
        env.logger.errorExt('API', error)
    })

    httpGate.onRequest(request => {
        if (request.method === 'GET') {
            onGet.Handler(request)
            return
        }
        if (request.method === 'POST') {
            onPost.Handler(request)
            return
        }

        request.reply(400, `request method "${request.method}" not supported`)
    })

    httpGate.onServerEvent(event => {
        onServerEvent.Handler(event)
    })

    httpGate.start(addr => {
        if (addr) {
            env.logger.debugExt('api', `start at http://${addr.url}:${addr.port} (ui ${env.options.manage.allowUi ? 'enabled' : 'disabled'})` )
        }
    })
}