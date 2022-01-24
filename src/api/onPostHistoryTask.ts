import path from 'path'
import * as vv from 'vv-common'
import { TPost, TPostHistoryServiceList, TPostHistoryServiceItemDownload, TPostHistoryServiceItemView, TReply, TReplyHistoryServiceList, TReplyHistoryServiceItemView, TPostHistoryTaskList, TReplyHistoryTaskList } from "./onPost"
import { env } from '../app'
import * as fs from 'fs'

export function OnPostHistoryTaskList(requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) {
    const rd = requestData as TPostHistoryTaskList
    const d1 = vv.toDate(rd.d1)
    const d2 = vv.toDate(rd.d2)
    if (!d1 || !d2) {
        callback(400, 'empty d1 or d2')
        return
    }
    vv.dir(env.options.task.path, {mode: 'paths', deep: 2}, (error, files) => {
        if (error) {
            callback(500, `in scan task result dir ${error.message}`)
            return
        }
        const reply: TReplyHistoryTaskList = {items: []}
        files.forEach(file => {
            const p = file.path.substring(env.options.task.path.length + 1, file.path.length ).replace(/\\/g, '/').split('/')
            if (p.length !== 2) return
            console.log(p[0], p[1])
            //todo тут!
        })
        callback(200, reply)
    })
}