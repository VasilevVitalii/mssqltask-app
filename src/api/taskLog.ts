import { env } from '../app'
import { TReplyBox, TPostHistoryTaskLog } from './index'
import * as vv from 'vv-common'
import * as path from 'path'
import * as fs from 'fs'

export type TFileHistoryTaskLog = {dd: string, tasks: string[]}

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
            const fileName = (item.file || '').toLowerCase()
            
            
            // if (path.parse(fileName).ext !== '.txt') return
            // const prefix = fileName.substring(0, 6) as 'error_' | 'debug_' | 'trace_'
            // if (prefix !== 'error_' && prefix !== 'debug_' && prefix !== 'trace_') return
            // const dateS = fileName.substring(6, 14)
            // const date = vv.toDate(dateS)
            // if (!date) return
            // let f = days.find(f => f.dd === dateS)
            // if (!f) {
            //     f = {dd: dateS, sizeError: undefined, sizeDebug: undefined, sizeTrace: undefined}
            //     days.push(f)
            // }
            // if (prefix === 'error_') {
            //     f.sizeError = item.fsstat.size
            // } else if (prefix === 'debug_') {
            //     f.sizeDebug = item.fsstat.size
            // } else if (prefix === 'trace_') {
            //     f.sizeTrace = item.fsstat.size
            // }
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

