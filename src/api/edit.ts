import { env } from '../app'
import { TPostEditChange, TPostEditDelete, TReplyBox } from './index'
import { Load as LoadMssql, TDepotMssql } from '../depotMssql'
import { Load as LoadTask, TDepotTask } from '../depotTask'
import * as vv from 'vv-common'

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
    ], (key, error) => {
        if (error) {
            callback({
                statusCode: 500,
                reply: {
                    kind: 'edit-delete',
                    error: error.message
                }
            })
        } else {
            callback({
                statusCode: 200,
                reply: {
                    kind: 'edit-delete'
                }
            })
        }
    })
}

export function Change(data: TPostEditChange, callback: (replyBox: TReplyBox) => void) {
    const mssqlNeedPass = (data.data?.mssqls || []).filter(f => f.file && !f.password)
    env.depot.app.get.obtain(mssqlNeedPass.map(m => { return {state: 'mssql', filterPath: m.path, filterFile: m.file} }), (error, rows) => {
        if (error) {
            callback({
                statusCode: 500,
                reply: {
                    kind: 'edit-delete',
                    error: error.message
                }
            })
            return
        }
        rows.filter(f => f.state === 'mssql').forEach(items => {
            items.rows.forEach(row => {
                const fnd = mssqlNeedPass.find(f => f.path === row.path && f.file === row.file)
                if (!fnd) return
                fnd.password = row.data?.password
            })
        })

        const mssqlNeedFile = (data.data?.mssqls || []).filter(f => !f.file)
        const prefix = vv.dateFormat(new Date(), 'yyyymmddhhmissmsec')
        mssqlNeedFile.forEach((item, idx) => {
            item.path = ""
            item.file = `${prefix}-${idx}-${vv.guid().replace(/-/g, '')}.json`
        })
        env.depot.app.set([
            {action: 'insert', state: 'mssql', rows: (data.data?.mssqls || []).map(m => { return {path: m.path, file: m.file, data: {...m, path: undefined, file: undefined} }})},
            {action: 'insert', state: 'task', rows: (data.data?.tasks || []).map(m => { return {path: m.path, file: m.file, data: {...m, path: undefined, file: undefined} }})},
        ], (key, error) => {
            if (error) {
                callback({
                    statusCode: 500,
                    reply: {
                        kind: 'edit-delete',
                        error: error.message
                    }
                })
            } else {
                callback({
                    statusCode: 200,
                    reply: {
                        kind: 'edit-delete'
                    }
                })
            }
        })
    })
}