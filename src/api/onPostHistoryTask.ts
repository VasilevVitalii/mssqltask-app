import path from 'path'
import * as vv from 'vv-common'
import { TPost, TReply, TPostHistoryTaskList, TReplyHistoryTaskList, TPostHistoryTaskDay, TReplyHistoryTaskDay, TPostHistoryTaskItemView, THistoryTaskItemType, TReplyHistoryTaskItemView, TReplyDepotLoad } from "./onPost"
import { env } from '../app'
import * as fs from 'fs'
import { TTicketResult } from 'mssqltask'
import { OnPostDepotLoad } from './onPostDepot'

export function OnPostHistoryTaskList(requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) {
    const rd = requestData as TPostHistoryTaskList
    const d1 = vv.toDate(rd.d1)?.getTime()
    const d2 = vv.toDate(rd.d2)?.getTime()
    if (!d1 || !d2) {
        callback(400, 'empty d1 or d2')
        return
    }
    vv.dir(env.options.task.path, {mode: 'paths', deep: 2}, (error, files) => {
        if (error) {
            callback(500, `in scan task result dir ${error.message}`)
            return
        }
        const reply: TReplyHistoryTaskList = {map: []}
        files.forEach(file => {
            const p = file.path.substring(env.options.task.path.length + 1, file.path.length).replace(/\\/g, '/').split('/')
            if (p.length !== 2) return
            const d = vv.toDate(p[0])?.getTime()
            if (!d || d1 > d || d > d2) return
            reply.map.push({d: p[0], task: p[1]})
        })
        callback(200, reply)
    })
}

export function OnPostHistoryTaskDay(requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) {
    const rd = requestData as TPostHistoryTaskDay
    if (!rd.d || !rd.task) {
        callback(400, 'empty d or task')
        return
    }

    const fileMask = new RegExp(`t.${rd.task}.${rd.d}.[0-9]*.json`,'gi')

    vv.dir(path.join(env.options.task.path, rd.d, rd.task), {mode: 'files', deep: 1}, (error, files) => {
        if (error) {
            callback(500, `in scan task result dir ${error.message}`)
            return
        }

        OnPostDepotLoad({kind: 'depotLoad', token: ''}, (code, data) => {
            const mssqllist = data as TReplyDepotLoad

            vv.readFiles(files.filter(f => f.file.match(fileMask)).map(m => {return path.join(m.path, m.file)}), {encoding: 'utf8'}, files => {
                const reply: TReplyHistoryTaskDay = {files: []}

                files.filter(f => f.fullFileName).forEach(f => {
                    f.fullFileName = f.fullFileName.substring(env.options.task.path.length + 1, f.fullFileName.length).replace(/\\/g, '/')
                    let ticketData = undefined as TTicketResult
                    try {
                        ticketData = JSON.parse(f.data)
                    } catch(error) {
                        //empty error handler
                    }
                    if (!ticketData) return

                    const p = path.parse(f.fullFileName)

                    reply.files.push({
                        path: p.dir,
                        file: p.base,
                        data: {...ticketData, servers: ticketData.servers.map(m => {
                            return {
                                ...m,
                                title: (mssqllist?.mssqls || []).find(f => vv.equal(f.instance, m.instance))?.title
                            }
                        })}
                    })
                })

                const fileReadError = files.find(f => f.errorRead)
                if (fileReadError) {
                    callback(500, `in read file ${fileReadError.fullFileName} ${fileReadError.errorRead}`)
                    return
                }

                callback(200, reply)
            })
        })
    })
}

export function OnPostHistoryTaskItemView(requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) {
    const rd = requestData as TPostHistoryTaskItemView
    if (!rd.type || !rd.pathTicket || !rd.fileTicket) {
        callback(400, 'empty type or pathTicket or fileTicket')
        return
    }
    fs.readFile(fn(rd.type, rd.pathTicket, rd.fileTicket, rd.serverIdxs), 'utf8', (error, data) => {
        if (error) {
            callback(500, `error read "${rd.type}" typed file by ticket ${rd.fileTicket}`)
            return
        }
        callback(200, {text: data} as TReplyHistoryTaskItemView)
    })
}

export function OnPostHistoryTaskItemDownload(requestData: TPost, callback: (fullFileName: string) => void) {
    const rd = requestData as TPostHistoryTaskItemView
    callback(fn(rd.type, rd.pathTicket, rd.fileTicket, rd.serverIdxs))
}

function fn(type: THistoryTaskItemType, pathTicket: string, fileTicket: string, serverIdxs: string): string {
    let f = `${path.parse(fileTicket).name}${type === 'ticket' ? '' : '.'.concat(serverIdxs)}.json`
    if (type === 'msg') {
        f = path.join('msg', 'm'.concat(f.substring(1, f.length)))
    }
    if (type === 'row') {
        f = path.join('row', 'r'.concat(f.substring(1, f.length)))
    }
    return path.join(env.options.task.path, pathTicket, f)
}