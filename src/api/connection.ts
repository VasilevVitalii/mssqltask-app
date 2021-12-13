import { TPostConnection, TReplyConnection, TReplyBox } from './index'
import * as mssqldriver from 'mssqldriver'
import { TDepotMssql } from '../depotMssql'
import { env } from '../app'

export function Test(data: TPostConnection, callback: (replyBox: TReplyBox) => void) {

    const res: TReplyConnection = {
        kind: 'test-connection',
        data: {
            mssqls: data.data.mssqls,
            errors: data.data.mssqls.map(() => { return undefined }),
            infos: data.data.mssqls.map(() => { return undefined }),
        }
    }

    getPassword(res.data.mssqls.filter(f => !f.password), (error) => {
        if (error) {
            callback({
                statusCode: 500,
                reply: {
                    kind: 'test-connection',
                    error: error.message
                }
            })
            return
        }

        res.data.mssqls.forEach((f, idx) => {
            const mssql = mssqldriver.Create({
                authentication: 'sqlserver',
                instance: f.instance,
                login: f.login,
                password: f.password,
                additional: {
                    appName: 'mssqltask-app-test-connection'
                }
            })
            mssql.ping((error, info) => {
                res.data.errors[idx] = error ? error.message || 'unknown error' : '',
                res.data.infos[idx] = info
                if (!res.data.errors.some(f => f === undefined)) {
                    callback({
                        statusCode: 200,
                        reply: res
                    })
                }
            })
        })
    })
}

function getPassword(mssqls: TDepotMssql[], callback: (error: Error) => void) {
    if (mssqls.length <= 0) {
        callback(undefined)
        return
    }
    env.depot.app.get.obtain(mssqls.map(m => {return {state: 'mssql', filterPath: m.path, filterFile: m.file}}), (error, result) => {
        if (error) {
            callback(error)
            return
        }
        const rows = (result.find(f => f.state === 'mssql')?.rows || [])
        mssqls.forEach(mssql => {
            const fnd = rows.find(f => f.path === mssql.path && f.file === mssql.file)
            if (!fnd) return
            mssql.password = fnd.data?.password
        })
        callback(undefined)
    })
}