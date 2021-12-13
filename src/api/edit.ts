import { env } from '../app'
import { TPostEditDelete, TReplyBox } from './index'
import { Load as LoadMssql, TDepotMssql } from '../depotMssql'
import { Load as LoadTask, TDepotTask } from '../depotTask'
import { TypeStateRowChange } from 'backdepot'

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

export function Delete(data: TPostEditDelete, callback: (replyBox: TReplyBox) => void) {
    const mssqls = (data.data?.mssqls || []).filter(f => f.file)
    const tasks = (data.data?.tasks || []).filter(f => f.file)

    env.depot.app.set([
        {action: 'delete', state: 'mssql', rows: mssqls},
        {action: 'delete', state: 'task', rows: tasks},
    ], key => {
        console.log(key)
        callback({
            statusCode: 200,
            reply: {
                kind: 'edit-delete'
            }
        })
    })
}