import * as vv from 'vv-common'
import { IApp, TypeStateRow } from 'backdepot'
import path from 'path'
import fs from 'fs'
import { TStateRow } from 'backdepot/dist/src/index.env'
import { TUpsert } from './depot'


export type TDepotMssql = {
    path: string,
    file: string,
    instance: string,
    login: string,
    password: string,
    tags: string[]
}

export function Load(depot: IApp, list: TDepotMssql[], dataPath: string, callback: (error: Error, isCreateExample: boolean, countLoaded: number) => void) {
    depot.get.obtain([{state: 'mssql'}], (error, states) => {
        if (error) {
            callback(error, false, 0)
            return
        }
        list.splice(0, list.length)
        const fnd = states ? states.find(f => f.state === 'mssql') : undefined
        if (!fnd || !fnd.rows || fnd.rows.length <= 0) {
            callback(undefined, true, 0)
            const fileExample = path.join(dataPath, 'example.json')
            fs.writeFile(fileExample, JSON.stringify(example(), null, 4), {encoding: 'utf8'}, () => {})
            return
        }
        list.push(...fnd.rows.map(m => { return getFromStorage(m) }))
        callback(undefined, false, list.length)
    })
}

export function Upsert(rows: TStateRow[], action: string, list: TDepotMssql[]): TUpsert  {
    const res = {delete: 0,update: 0,insert: 0} as TUpsert
    if (action === 'insert') {
        rows.forEach(row => {
            const item = getFromStorage(row)
            const fnd = list.find(f => vv.equal(f.path, item.path) && vv.equal(f.file, item.file))
            if (fnd) {
                fnd.instance = item.instance
                fnd.login = item.login
                fnd.password = item.password,
                fnd.tags = item.tags
                res.update++
            } else {
                list.push(item)
                res.insert++
            }
        })
    } else if (action === 'delete') {
        rows.forEach(row => {
            const idx = list.findIndex(f => vv.equal(f.path, row.path) && vv.equal(f.file, row.file))
            if (idx < 0) return
            list.splice(idx, 1)
            res.delete++
        })
    }

    return res
}

function getFromStorage(row: TypeStateRow): TDepotMssql {
    return {
        path: row.path,
        file: row.file,
        instance: vv.toString(row.data?.instance) || '',
        login: vv.toString(row.data?.login) || '',
        password: vv.toString(row.data?.password) || '',
        tags: vv.toArray(row.data?.tags) || []
    }
}

function example(): TDepotMssql {
    return {
        path: undefined,
        file: undefined,
        instance: 'myserver/mysqlinstance',
        login: 'sa',
        password: 'password for sa',
        tags: ['tag1', 'tag2']
    }
}