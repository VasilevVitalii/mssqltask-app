import { env } from './app'
import { TPostEditLoad, TReplyBox } from './console'

export function Load(post: TPostEditLoad, callback: (replyBox: TReplyBox) => void) {
    env.depot.app.get.obtain([{state: 'mssql'}, {state: 'task'}], (error, rows) => {
        if (error) {
            callback({
                statusCode: 500,
                reply: {
                    kind: 'edit-load',
                    error: error.message
                }
            })
            return
        }
        callback({
            statusCode: 200,
            reply: {
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
        })
    })
}