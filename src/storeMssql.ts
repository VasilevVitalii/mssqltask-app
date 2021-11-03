import * as vv from 'vv-common'
import { TypeStateRow } from 'backdepot'

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