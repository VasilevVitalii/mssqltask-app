import { env } from '../app'
import { TReplyBox, TPostHistoryServiceLog, TPostHistoryServiceLogItem } from './index'
import * as vv from 'vv-common'
import * as path from 'path'
import * as fs from 'fs'

export type TFileHistoryServiceLog = {dd: string, sizeError: number | undefined, sizeDebug: number | undefined, sizeTrace: number | undefined}

export function LoadList(data: TPostHistoryServiceLog, callback: (replyBox: TReplyBox) => void) {
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
    vv.dir(env.options.log.path, {mode: 'files', deep: 1}, (error, result) => {
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
        const days: TFileHistoryServiceLog[] = []
        result.forEach(item => {
            const fileName = (item.file || '').toLowerCase()
            if (path.parse(fileName).ext !== '.txt') return
            const prefix = fileName.substring(0, 6) as 'error_' | 'debug_' | 'trace_'
            if (prefix !== 'error_' && prefix !== 'debug_' && prefix !== 'trace_') return
            const dateS = fileName.substring(6, 14)
            const date = vv.toDate(dateS)
            if (!date) return
            let f = days.find(f => f.dd === dateS)
            if (!f) {
                f = {dd: dateS, sizeError: undefined, sizeDebug: undefined, sizeTrace: undefined}
                days.push(f)
            }
            if (prefix === 'error_') {
                f.sizeError = item.fsstat.size
            } else if (prefix === 'debug_') {
                f.sizeDebug = item.fsstat.size
            } else if (prefix === 'trace_') {
                f.sizeTrace = item.fsstat.size
            }
        })
        callback({
            statusCode: 200,
            reply: {
                kind: 'history-service-log',
                data: {
                    days: days.sort((a,b) => {
                        if (a.dd > b.dd) return -1
                        if (a.dd < b.dd) return 1
                        return 0
                    })
                }
            }
        })
    })
}

export function LoadText(data: TPostHistoryServiceLogItem, callback: (replyBox: TReplyBox) => void) {
    const fullFileName = GetLogFullFileName(data.data?.dd, data.data?.kind)

    if (!fullFileName) {
        callback({
            statusCode: 400,
            reply: {
                kind: 'history-service-log-item',
                error: 'empty data.dd or data.kind'
            }
        })
        return
    }

    fs.readFile(fullFileName, 'utf-8', (error, data) => {
        if (error) {
            callback({
                statusCode: 500,
                reply: {
                    kind: 'history-service-log-item',
                    error: error.message
                }
            })
            return
        }
        callback({
            statusCode: 200,
            reply: {
                kind: 'history-service-log-item',
                data: {
                    text: data
                }
            }
        })
    })
}

export function GetLogFullFileName(dd: string, kind: 'error' | 'debug' | 'trace'): string {
    if (!kind) return undefined
    const d = vv.toDate(dd)
    if (!d) return undefined
    return path.join(env.options.log.path, `${kind}_${vv.dateFormat(d, 'yyyymmdd')}.txt`)
}