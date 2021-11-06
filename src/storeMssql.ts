import * as vv from 'vv-common'
import { IApp, TypeStateRow } from 'backdepot'
import path from 'path'
import fs from 'fs'

export type TMssql = {
    path: string,
    file: string,
    instance: string,
    login: string,
    password: string,
    tags: string[]
}

export function GetFromStorage(row: TypeStateRow): TMssql {
    return {
        path: row.path,
        file: row.file,
        instance: vv.toString(row.data?.instance) || '',
        login: vv.toString(row.data?.login) || '',
        password: vv.toString(row.data?.password) || '',
        tags: vv.toArray(row.data?.tags) || []
    }
}

export function UpsertList(list: TMssql[], item: TMssql) {
    const fnd = list.find(f => vv.equal(f.path, item.path) && vv.equal(f.file, item.file))
    if (fnd) {
        fnd.instance = item.instance
        fnd.login = item.login
        fnd.password = item.password,
        fnd.tags = item.tags
    } else {
        list.push(item)
    }
}

export function SpliceList(list: TMssql[], path: string, file: string) {
    const idx = list.findIndex(f => vv.equal(f.path, path) && vv.equal(f.file, file))
    if (idx < 0) return
    list.splice(idx, 1)
}

export function LoadAll(depot: IApp, dataPath: string, callback: (error: Error, list: TMssql[]) => void) {
    depot.get.obtain([{state: 'mssql'}], (error, states) => {
        if (error) {
            callback(error, undefined)
            return
        }
        const fnd = states ? states.find(f => f.state === 'mssql') : undefined
        if (!fnd || !fnd.rows) {
            const fileExample = path.join(dataPath, 'example.json')
            fs.writeFile(fileExample, JSON.stringify(Example(), null, 4), {encoding: 'utf8'}, () => {})
            callback(undefined, [])
            return
        }
        callback(undefined, fnd.rows.map(m => { return GetFromStorage(m) }))
    })
}

export function Example(): TMssql {
    return {
        path: undefined,
        file: undefined,
        instance: 'myserver/mysqlinstance',
        login: 'sa',
        password: 'password for sa',
        tags: ['tag1', 'tag2']
    }
}