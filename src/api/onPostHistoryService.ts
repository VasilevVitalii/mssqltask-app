import path from 'path'
import * as vv from 'vv-common'
import { TPost, TPostHistoryServiceList, TPostHistoryServiceItemDownload, TPostHistoryServiceItemView, TReply, TReplyHistoryServiceList, TReplyHistoryServiceItemView } from "./onPost"
import { env } from '../app'
import * as fs from 'fs'

export function OnPostHistoryServiceList(requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) {
    const rd = requestData as TPostHistoryServiceList
    const d1 = vv.toDate(rd.d1)?.getTime()
    const d2 = vv.toDate(rd.d2)?.getTime()
    if (!d1 || !d2) {
        callback(400, 'empty d1 or d2')
        return
    }
    const reply: TReplyHistoryServiceList = {items: []}

    vv.dir(env.options.log.path, {deep: 1, mode: 'files'}, (error, files) => {
        if (error) {
            callback(500, `in scan log dir ${error.message}`)
            return
        }
        files.forEach(file => {
            if (file.file.length !== 18) return
            if (!vv.equal(path.parse(file.file).ext, '.txt')) return

            const fileDate = vv.toDate(file.file.substring(6, 14))
            if (!fileDate) return
            const fileTime = fileDate.getTime()
            if (d1 > fileTime || fileTime > d2) return

            const filePrefix = (file.file.substring(0, 6) || '').toLowerCase() as 'error_' | 'debug_' | 'trace_'
            if (filePrefix === 'error_') {
                reply.items.push({type: 'error', d: vv.dateFormat(fileDate, 'yyyymmdd'), fileName: file.file, size: file.fsstat.size})
            } else if (filePrefix === 'trace_') {
                reply.items.push({type: 'trace', d: vv.dateFormat(fileDate, 'yyyymmdd'), fileName: file.file, size: file.fsstat.size})
            } else if (filePrefix === 'debug_') {
                reply.items.push({type: 'debug', d: vv.dateFormat(fileDate, 'yyyymmdd'), fileName: file.file, size: file.fsstat.size})
            }
        })

        callback(200, reply)
    })
}

export function OnPostHistoryServiceItemView(requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) {
    const rd = requestData as TPostHistoryServiceItemView
    const fullFileName = path.join(env.options.log.path, rd.fileName)
    fs.readFile(fullFileName, 'utf8', (error, data) => {
        if (error) {
            callback(500, `error read file ${rd.fileName}`)
            return
        }
        callback(200, {text: data} as TReplyHistoryServiceItemView)
    })
}

export function OnPostHistoryServiceItemDownload(requestData: TPost, callback: (fullFileName: string) => void) {
    const rd = requestData as TPostHistoryServiceItemDownload
    const fullFileName = path.join(env.options.log.path, rd.fileName)
    callback(fullFileName)
}