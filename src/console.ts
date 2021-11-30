import * as vv from 'vv-common'
import { env } from './app'
import { Create as CreateHttpGate } from 'vv-httpgate'

export function Go() {
    if (!env.options.console.allowApi) return

    const httpGate = CreateHttpGate({url: env.options.console.http})
    httpGate.onError(error => {
        env.logger.error('CONSOLE', error)
    })
    httpGate.onRequest(request => {
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