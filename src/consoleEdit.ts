import { TRequest } from 'vv-httpgate'
import { env } from './app'
import { TReplyEditLoad } from './console'

export function Load(request: TRequest) {
    env.depot.app.get.obtain([{state: 'mssql'}, {state: 'task'}], (error, rows) => {
        if (error) {
            request.reply(500, error.message)
            return
        }
        const result: TReplyEditLoad = {
            kind: 'edit-load',
            data: {
                mssqls: (rows.find(f => f.state === 'mssql')?.rows || []).map(m => { return {
                    path: m.path,
                    file: m.file,
                    data: m.data
                }}),
                tasks: (rows.find(f => f.state === 'task')?.rows || []).map(m => { return {
                    path: m.path,
                    file: m.file,
                    data: m.data
                }})
            }
        }
        request.replySetHeader('content-type', 'application/json; charset=UTF-8')
        request.reply(200, result)
    })
}