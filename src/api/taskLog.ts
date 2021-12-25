import { env } from '../app'
import { TReplyBox, TPostHistoryTaskLog } from './index'
import * as vv from 'vv-common'
import * as path from 'path'
import * as fs from 'fs'

export type TFileHistoryTaskLog = {task: string, dds: string[]}

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

