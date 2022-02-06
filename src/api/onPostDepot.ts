import * as vv from 'vv-common'
import { Create as CreateServer, IApp as mssqldriver } from 'mssqldriver'
import { TPost, TPostDepotSave, TPostDepotTestConnection, TReply, TReplyDepotLoad, TReplyDepotTestConnection } from "./onPost"
import { Load as LoadMssql, TDepotMssql } from '../depotMssql'
import { Load as LoadTask, TDepotTask } from '../depotTask'
import { env } from '../app'

export function OnPostDepotLoad(requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) {
    const mssqls: TDepotMssql[] = []
    const tasks: TDepotTask[] = []

    LoadMssql(env.depot.app, mssqls, undefined, error => {
        if (error) {
            callback(500, error.message)
            return
        }
        mssqls.forEach(item => { item.password = undefined })
        LoadTask(env.depot.app, tasks, undefined, error => {
            if (error) {
                callback(500, error.message)
                return
            }
            callback(200, {mssqls, tasks} as TReplyDepotLoad)
        })
    })
}

export function OnPostDepotSave(requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) {
    const rd = requestData as TPostDepotSave
    del(rd.delete?.mssqls || [], rd.delete?.tasks || [], error => {
        if (error) {
            callback(500, error.message)
            return
        }
        ups(rd.upsert?.mssqls || [], rd.upsert?.tasks || [], error => {
            if (error) {
                callback(500, error.message)
                return
            }
            OnPostDepotLoad(requestData, callback)
        })
    })
}

export function OnPostDepotTestConnection(requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) {
    const rd = requestData as TPostDepotTestConnection

    conn(rd, (error, mssqldriver) => {
        if (error) {
            callback(500, error.message)
            return
        }
        if (!mssqldriver) {
            callback(500, `no find server`)
            return
        }
        mssqldriver.ping((error, info) => {
            if (error) {
                callback(200, {instance: rd.instance, login: rd.login, result: false, resultText: error.message} as TReplyDepotTestConnection)
            } else {
                callback(200, {instance: rd.instance, login: rd.login, result: true, resultText: `version=${info.version}; timezone=${info.timezone};duration=${info.duration}`} as TReplyDepotTestConnection)
            }
        })
    })
}

function del(mssqls: {path: string, file: string}[], tasks: {path: string, file: string}[], callback: (error: Error) => void) {
    env.depot.app.set([
        {action: 'delete', state: 'mssql', rows: mssqls.filter(f => f.file)},
        {action: 'delete', state: 'task', rows: tasks.filter(f => f.file)},
    ], (key, error) => {
        callback(error)
    })
}

function ups(mssqls: TDepotMssql[], tasks: TDepotTask[], callback: (error: Error) => void) {
    const mssqlNeedPass = mssqls.filter(f => f.file && !f.password)
    env.depot.app.get.obtain(mssqlNeedPass.map(m => { return {state: 'mssql', filterPath: m.path, filterFile: m.file} }), (error, rows) => {
        if (error) {
            callback(error)
            return
        }
        rows.filter(f => f.state === 'mssql').forEach(items => {
            items.rows.forEach(row => {
                const fnd = mssqlNeedPass.find(f => f.path === row.path && f.file === row.file)
                if (!fnd) return
                fnd.password = row.data?.password
            })
        })

        const mssqlNeedFile = mssqls.filter(f => !f.file)
        const taskNeedFile = tasks.filter(f => !f.file)
        const prefix = vv.dateFormat(new Date(), 'yyyymmddhhmissmsec')
        mssqlNeedFile.forEach((item, idx) => {
            item.path = ""
            item.file = `mssql-${prefix}-${idx}-${vv.guid().replace(/-/g, '')}.json`
        })
        taskNeedFile.forEach((item, idx) => {
            item.path = ""
            item.file = `task-${prefix}-${idx}-${vv.guid().replace(/-/g, '')}.json`
        })
        env.depot.app.set([
            {action: 'insert', state: 'mssql', rows: mssqls.map(m => { return {path: m.path, file: m.file, data: {...m, path: undefined, file: undefined} }})},
            {action: 'insert', state: 'task', rows: tasks.map(m => { return {path: m.path, file: m.file, data: {...m, path: undefined, file: undefined} }})},
        ], (key, error) => {
            callback(error)
        })
    })
}

function conn (requestData: TPostDepotTestConnection, callback: (error: Error, driver: mssqldriver) => void) {
    if (requestData.passwordFromDepot && requestData.passwordFromDepot.file) {
        env.depot.app.get.obtain([{state: 'mssql', filterPath: requestData.passwordFromDepot.path, filterFile: requestData.passwordFromDepot.file}], (error, rows) => {
            if (error) {
                callback(error, undefined)
                return
            }
            if (rows.length <= 0 || rows[0].rows.length <= 0) {
                callback(undefined, undefined)
                return
            }
            callback(undefined, CreateServer({
                authentication: 'sqlserver',
                instance: requestData.instance,
                login: requestData.login,
                password: (rows[0].rows[0].data as TDepotMssql).password
            }))
        })
    } else {
        callback(undefined, CreateServer({
            authentication: 'sqlserver',
            instance: requestData.instance,
            login: requestData.login,
            password: requestData.password
        }))
    }
}