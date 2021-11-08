import { TypeMetronom } from 'mssqltask'
import * as vv from 'vv-common'
import { IApp, TypeStateRow } from 'backdepot'
import path from 'path'
import fs from 'fs'
import { TStateRow } from 'backdepot/dist/src/index.env'

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

export function Load(depot: IApp, list: TTask[], dataPath: string, callback: (error: Error) => void) {
    depot.get.obtain([{state: 'task'}], (error, states) => {
        if (error) {
            callback(error)
            return
        }
        list.splice(0, list.length)
        const fnd = states ? states.find(f => f.state === 'task') : undefined
        if (!fnd || !fnd.rows || fnd.rows.length <= 0) {
            const fileExample1 = path.join(dataPath, 'example1.json')
            const fileExample2 = path.join(dataPath, 'example2.json')
            fs.writeFile(fileExample1, JSON.stringify(example1(), null, 4), {encoding: 'utf8'}, () => {})
            fs.writeFile(fileExample2, JSON.stringify(example2(), null, 4), {encoding: 'utf8'}, () => {})
            callback(undefined)
            return
        }
        list.push(...fnd.rows.map(m => { return getFromStorage(m) }))
        callback(undefined)
    })
}

export function Upsert(rows: TStateRow[], action: string, list: TTask[]) {
    if (action === 'insert') {
        rows.forEach(row => {
            const item = getFromStorage(row)
            const fnd = list.find(f => vv.equal(f.path, item.path) && vv.equal(f.file, item.file))
            if (fnd) {
                fnd.name = item.name
                fnd.metronom = item.metronom
                fnd.queries = item.queries
                fnd.mssqls = item.mssqls
            } else {
                list.push(item)
            }
        })
    } else if (action === 'delete') {
        rows.forEach(row => {
            const idx = list.findIndex(f => vv.equal(f.path, row.path) && vv.equal(f.file, row.file))
            if (idx < 0) return
            list.splice(idx, 1)
        })
    }
}

function getFromStorage(row: TypeStateRow): TTask {
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

function example1(): TTask {
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

function example2(): TTask {
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