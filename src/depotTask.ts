import { TypeMetronom } from 'mssqltask'
import * as vv from 'vv-common'
import { IApp, TypeStateRow } from 'backdepot'
import path from 'path'
import fs from 'fs'
import { TStateRow } from 'backdepot/dist/src/index.env'
import { TUpsert } from './depot'

export type TDepotTask = {
    path: string | undefined,
    file: string | undefined,
    key: string,
    title: string,
    metronom: TypeMetronom,
    queries: string[],
    allowExec: boolean,
    allowRows: boolean,
    allowMessages: boolean,
    mssqls: {
        instances: string[],
        tags: string[]
    }
}

export function Load(depot: IApp, list: TDepotTask[], dataPath: string, callback: (error: Error | undefined, isCreateExample: boolean, countLoaded: number) => void) {
    depot.get.obtain([{state: 'task'}], (error, states) => {
        if (error) {
            callback(error, false, 0)
            return
        }
        list.splice(0, list.length)
        const fnd = states ? states.find(f => f.state === 'task') : undefined
        if (!fnd || !fnd.rows || fnd.rows.length <= 0) {
            callback(undefined, true, 0)
            if(dataPath) {
                const fileExample1 = path.join(dataPath, 'example1.json')
                const fileExample2 = path.join(dataPath, 'example2.json')
                fs.writeFile(fileExample1, JSON.stringify(example1(), null, 4), {encoding: 'utf8'}, () => {})
                fs.writeFile(fileExample2, JSON.stringify(example2(), null, 4), {encoding: 'utf8'}, () => {})
            }
            return
        }
        list.push(...fnd.rows.map(m => { return getFromStorage(m) }))
        callback(undefined, false, list.length)
    })
}

export function Upsert(rows: TStateRow[], action: string, list: TDepotTask[]): TUpsert {
    const res: TUpsert = {delete: 0,update: 0,insert: 0}
    if (action === 'insert') {
        rows.forEach(row => {
            const item = getFromStorage(row)
            const fnd = list.find(f => vv.equal(f.path, item.path) && vv.equal(f.file, item.file))
            if (fnd) {
                fnd.key = item.key
                fnd.title = item.title
                fnd.metronom = item.metronom
                fnd.queries = item.queries
                fnd.allowExec = item.allowExec
                fnd.allowRows = item.allowRows
                fnd.allowMessages = item.allowMessages
                fnd.mssqls = item.mssqls
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

function getFromStorage(row: TypeStateRow): TDepotTask {
    let metronom: TypeMetronom | undefined = undefined
    if (row.data?.metronom?.kind === 'cron') {
        metronom = {
            kind: 'cron',
            cron: vv.toString(row.data?.metronom?.cron)
        }
    } else if (row.data?.metronom?.kind === 'custom') {
        const periodicity = vv.toString(vv.toBool(row.data?.metronom?.periodicity))
        metronom = {
            kind: 'custom',
            weekdaySun: vv.nz(vv.toBool(row.data?.metronom?.weekdaySun), false),
            weekdayMon: vv.nz(vv.toBool(row.data?.metronom?.weekdayMon), false),
            weekdayTue: vv.nz(vv.toBool(row.data?.metronom?.weekdayTue), false),
            weekdayWed: vv.nz(vv.toBool(row.data?.metronom?.weekdayWed), false),
            weekdayThu: vv.nz(vv.toBool(row.data?.metronom?.weekdayThu), false),
            weekdayFri: vv.nz(vv.toBool(row.data?.metronom?.weekdayFri), false),
            weekdaySat: vv.nz(vv.toBool(row.data?.metronom?.weekdaySat), false),
            periodMinutes: vv.nz(vv.toInt(row.data?.metronom?.periodMinutes), 1),
            periodicity: periodicity === 'every' || periodicity === 'once' ? periodicity : 'every'
        }
        if (metronom.periodMinutes <= 0) metronom.periodMinutes = 1
    }

    return {
        path: row.path,
        file: row.file,
        key: vv.nz(vv.toString(row.data?.key), '').trim(),
        title: vv.nz(vv.toString(row.data?.title), '').trim(),
        metronom: metronom as TypeMetronom,
        queries: vv.toArray(row.data?.queries) || [],
        allowExec: vv.nz(vv.toBool(row.data?.allowExec), true),
        allowRows: vv.nz(vv.toBool(row.data?.allowRows), true),
        allowMessages: vv.nz(vv.toBool(row.data?.allowMessages), true),
        mssqls: {
            instances: (vv.toArray(row.data?.mssqls?.instances) || []).map(m => { return (vv.toString(m) || '').replace(/\\/g, '/') } ),
            tags: vv.toArray(row.data?.mssqls?.tags) || []
        }
    }
}

function example1(): TDepotTask {
    return {
        path: undefined,
        file: undefined,
        key: 'task1',
        title: 'example 1',
        metronom: {kind: 'cron', cron: '0 */1 * * * *'},
        queries: ['SELECT * FROM sys.objects'],
        allowExec: true,
        allowRows: true,
        allowMessages: true,
        mssqls: {
            instances: ['myserver/mysqlinstance'],
            tags: []
        }
    }
}

function example2(): TDepotTask {
    return {
        path: undefined,
        file: undefined,
        key: 'task2',
        title: 'example 2',
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
        allowExec: true,
        allowRows: true,
        allowMessages: true,
        mssqls: {
            instances: [],
            tags: ['tag1']
        }
    }
}