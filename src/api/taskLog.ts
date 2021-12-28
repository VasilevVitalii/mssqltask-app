import { env } from '../app'
import { TReplyBox, TPostHistoryTaskLog, TPostHistoryTaskLogTickets } from './index'
import * as vv from 'vv-common'
import * as path from 'path'
import * as fs from 'fs'
import { TTicketResult } from 'mssqltask'

export type TFileHistoryTaskLog = {task: string, dds: string[]}
export type TFileHistoryTaskLogTickets = {
    idx: number,
    file: string,
    errorRead: string,
    result: TTicketResult
}

export function LoadList(data: TPostHistoryTaskLog, callback: (replyBox: TReplyBox) => void) {
    const dd1 = vv.toDate(data.data?.dd1)
    const dd2 = vv.toDate(data.data?.dd2)
    if (!dd1 || !dd2) {
        callback({
            statusCode: 400,
            reply: {
                kind: 'history-service-log',
                error: 'empty data.dd1 or data.dd2'
            }
        })
        return
    }

    const truePaths = [] as string[]
    let d = dd1
    while (d <= dd2) {
        truePaths.push(vv.dateFormat(d, 'yyyymmdd'))
        d = vv.dateAdd(d, 'day', 1)
    }

    vv.dir(env.options.task.path, {mode: 'paths', deep: 2}, (error, result) => {
        if (error) {
            callback({
                statusCode: 500,
                reply: {
                    kind: 'history-service-log',
                    error: error.message
                }
            })
            return
        }
        const tasks: TFileHistoryTaskLog[] = []
        result.forEach(item => {
            const p = path.relative(env.options.task.path, item.path)
            if (p.length < 9) return
            const pd = p.substring(0, 8)
            if (!truePaths.includes(pd)) return
            const task = p.substring(8, p.length).replace(/\\/g, '').replace(/\//g, '').trim()
            if (task.length <= 0) return
            let fnd = tasks.find(f => f.task === task)
            if (!fnd) {
                fnd = {task: task, dds: []}
                tasks.push(fnd)
            }
            if (!fnd.dds.includes(pd)) {
                fnd.dds.push(pd)
            }
        })
        tasks.forEach(t => {
            t.dds.sort((a,b) => {
                if (a > b) return -1
                if (a < b) return 1
                return 0
            })
        })
        tasks.sort((a, b) => {
            if (a.task > b.task) return 1
            if (a.task < b.task) return -1
            return 0
        })
        callback({
            statusCode: 200,
            reply: {
                kind: 'history-task-log',
                data: {
                    tasks: tasks
                }
            }
        })
    })
}

export function LoadTickets(data: TPostHistoryTaskLogTickets, callback: (replyBox: TReplyBox) => void) {
    const task = data.data?.task
    const dd = vv.toDate(data.data?.dd)
    if (!task || !dd) {
        callback({
            statusCode: 400,
            reply: {
                kind: 'history-task-log-tickets',
                error: 'empty data.task or data.dd'
            }
        })
        return
    }

    const d = vv.dateFormat(dd, 'yyyymmdd')
    const p = path.join(env.options.task.path, d, task)
    const fileMask = new RegExp(`t.${task}.${d}.[0-9]*.json`,'gi')

    vv.dir(p, {mode: 'files', deep: 1}, (error, result) => {
        if (error) {
            callback({
                statusCode: 500,
                reply: {
                    kind: 'history-task-log-tickets',
                    error: error.message
                }
            })
            return
        }
        const files = result.filter(f => f.file && f.file.match(fileMask)).map(m => { return path.join(m.path, m.file) })
        const tickets = [] as TFileHistoryTaskLogTickets[]
        readTickets(files, 0, tickets, () => {
            callback({
                statusCode: 200,
                reply: {
                    kind: 'history-task-log-tickets',
                    data: {
                        tickets: tickets
                    }
                }
            })
        })
    })
}

function readTickets(files: string[], idx: number, tickets: TFileHistoryTaskLogTickets[], callback: () => void) {
    if (idx >= files.length) {
        callback()
        return
    }
    const f = files[idx]
    const ticket: TFileHistoryTaskLogTickets = {
        idx: idx,
        file: path.parse(f).base,
        errorRead: '',
        result: undefined
    }
    tickets.push(ticket)
    fs.readFile(f, 'utf-8', (error, raw) => {
        if (error) {
            ticket.errorRead = error.message
        } else {
            try {
                ticket.result = JSON.parse(raw)
            } catch (error) {
                ticket.errorRead = (error as Error).message
            }
        }
        idx++
        readTickets(files, idx, tickets, callback)
    })
}