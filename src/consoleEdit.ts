import { env } from './app'
import { TReplyBox } from './console'
import { Load as LoadMssql, TDepotMssql } from './depotMssql'
import { Load as LoadTask, TDepotTask } from './depotTask'

export function Load(callback: (replyBox: TReplyBox) => void) {

    const mssqls: TDepotMssql[] = []
    const tasks: TDepotTask[] = []

    LoadMssql(env.depot.app, mssqls, undefined, error => {
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
        mssqls.forEach(item => { item.password = undefined })
        LoadTask(env.depot.app, tasks, undefined, error => {
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
                        mssqls: mssqls,
                        tasks: tasks
                    }
                }
            })
        })
    })
}