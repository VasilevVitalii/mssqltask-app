import { TypeMetronom } from 'mssqltask'
import * as vv from 'vv-common'
import { IApp, TypeStateRow } from 'backdepot'
import path from 'path'
import fs from 'fs'

export type TTask = {
    path: string,
    file: string,
    name: string,
    metronom: TypeMetronom,
    queries: string[],
    mssqls: {
        instances: string[],
        tags: string[]
    }
}

export function GetFromStorage(row: TypeStateRow): TTask {
    let metronom = undefined as TypeMetronom
    if (row.data?.metronom?.kind === 'cron') {
        metronom = {
            kind: 'cron',
            cron: vv.toString(row.data?.metronom?.cron)
        }
    } else if (row.data?.metronom?.kind === 'custom') {
        const periodicity = vv.toString(vv.toBool(row.data?.metronom?.periodicity))
        metronom = {
            kind: 'custom',
            weekdaySun: vv.nz(vv.toBool(row.data?.metronom?.weekdaySun), true),
            weekdayMon: vv.nz(vv.toBool(row.data?.metronom?.weekdayMon), true),
            weekdayTue: vv.nz(vv.toBool(row.data?.metronom?.weekdayTue), true),
            weekdayWed: vv.nz(vv.toBool(row.data?.metronom?.weekdayWed), true),
            weekdayThu: vv.nz(vv.toBool(row.data?.metronom?.weekdayThu), true),
            weekdayFri: vv.nz(vv.toBool(row.data?.metronom?.weekdayFri), true),
            weekdaySat: vv.nz(vv.toBool(row.data?.metronom?.weekdaySat), true),
            periodMinutes: vv.nz(vv.toInt(row.data?.metronom?.periodMinutes), 1),
            periodicity: periodicity === 'every' || periodicity === 'once' ? periodicity : 'every'
        }
        if (metronom.periodMinutes <= 0) metronom.periodMinutes = 1
    }

    return {
        path: row.path,
        file: row.file,
        name: row.data?.name,
        metronom: metronom,
        queries: vv.toArray(row.data?.queries) || [],
        mssqls: {
            instances: vv.toArray(row.data?.mssqls?.instances) || [],
            tags: vv.toArray(row.data?.mssqls?.tags) || []
        }
    }
}

export function UpsertList(list: TTask[], item: TTask) {
    const fnd = list.find(f => vv.equal(f.path, item.path) && vv.equal(f.file, item.file))
    if (fnd) {
        fnd.name = item.name
        fnd.metronom = item.metronom
        fnd.queries = item.queries
        fnd.mssqls = item.mssqls
    } else {
        list.push(item)
    }
}

export function SpliceList(list: TTask[], path: string, file: string) {
    const idx = list.findIndex(f => vv.equal(f.path, path) && vv.equal(f.file, file))
    if (idx < 0) return
    list.splice(idx, 1)
}

export function LoadAll(depot: IApp, dataPath: string, callback: (error: Error, list: TTask[]) => void) {
    depot.get.obtain([{state: 'task'}], (error, states) => {
        if (error) {
            callback(error, undefined)
            return
        }
        const fnd = states ? states.find(f => f.state === 'task') : undefined
        if (!fnd || !fnd.rows) {
            const fileExample = path.join(dataPath, 'example.json')
            fs.writeFile(fileExample, JSON.stringify(Example1(), null, 4), {encoding: 'utf8'}, () => {})
            fs.writeFile(fileExample, JSON.stringify(Example2(), null, 4), {encoding: 'utf8'}, () => {})
            callback(undefined, [])
            return
        }
        callback(undefined, fnd.rows.map(m => { return GetFromStorage(m) }))
    })
}

export function Example1(): TTask {
    return {
        path: undefined,
        file: undefined,
        name: 'example 1',
        metronom: {kind: 'cron', cron: '0 */1 * * * *'},
        queries: ['SELECT * FROM sys.objects'],
        mssqls: {
            instances: ['myserver/mysqlinstance'],
            tags: []
        }
    }
}

export function Example2(): TTask {
    return {
        path: undefined,
        file: undefined,
        name: 'example 1',
        metronom: {
            kind: 'custom',
            weekdaySun: true,
            weekdayMon: true,
            weekdayTue: true,
            weekdayWed: true,
            weekdayThu: true,
            weekdayFri: true,
            weekdaySat: true,
            periodMinutes: 1,
            periodicity: 'every'
        },
        queries: ['SELECT * FROM sys.objects'],
        mssqls: {
            instances: [],
            tags: ['tag1']
        }
    }
}