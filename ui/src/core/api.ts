import { THistoryTaskItemType, TPostDepotLoad, TPostDepotSave, TPostHistoryServiceItemDownload, TPostHistoryServiceItemView, TPostHistoryServiceList, TReplyDepotLoad, TReplyDepotSave, TReplyDepotTestConnection, TReplyHistoryServiceItemView, TReplyHistoryServiceList, TReplyHistoryTaskDay, TReplyHistoryTaskItemView, TReplyHistoryTaskList } from '../../../src/api/onPost'
import { send as sendToBackend } from './axios'
import * as vv from "vv-common"

export default {
    depotLoad: (callback: (result: TReplyDepotLoad | undefined) => void ) => {
        sendToBackend({kind: 'depotLoad', token: ''}, result => {
            callback(result ? result as TReplyDepotLoad : undefined)
        })
    },
    depotSave: (options: TPostDepotSave & {token?: string, kind?: string}, callback: (result: TReplyDepotSave | undefined) => void ) => {
        sendToBackend({...options, kind: 'depotSave'}, result => {
            callback(result ? result as TReplyDepotSave : undefined)
        })
    },
    depotTestConnection: (options: {instance: string, login: string, password: string, passwordFromDepot?: {path: string , file: string}}, callback: (result: TReplyDepotTestConnection | undefined) => void) => {
        sendToBackend({kind: 'depotTestConnection', token: '', ...options}, result => {
            callback(result ? result as TReplyDepotTestConnection : undefined)
        })
    },
    historyServiceList: (options: {d1: Date, d2: Date}, callback: (result: TReplyHistoryServiceList | undefined) => void ) => {
        sendToBackend({kind: 'historyServiceList', d1: vv.dateFormat(options.d1, 'yyyymmdd'), d2: vv.dateFormat(options.d2, 'yyyymmdd'), token: ''}, result => {
            callback(result ? result as TReplyHistoryServiceList : undefined)
        })
    },
    historyServiceItemView: (options: {file: string}, callback: (result: TReplyHistoryServiceItemView | undefined) => void ) => {
        sendToBackend({kind: 'historyServiceItemView', file: options.file, token: ''}, result => {
            callback(result ? result as TReplyHistoryServiceItemView : undefined)
        })
    },
    historyServiceItemDownload: (options: {file: string}, callback: (blob: Blob, filename: string) => void ) => {
        sendToBackend({kind: 'historyServiceItemDownload', file: options.file, token: ''}, (result, headers) => {
            callback(result, headers ? headers["content-disposition"].split("filename=")[1] : "unknownFile")
        })
    },
    historyTaskList: (options: {d1: Date, d2: Date}, callback: (result: TReplyHistoryTaskList | undefined) => void ) => {
        sendToBackend({kind: 'historyTaskList', d1: vv.dateFormat(options.d1, 'yyyymmdd'), d2: vv.dateFormat(options.d2, 'yyyymmdd'), token: ''}, result => {
            callback(result ? result as TReplyHistoryTaskList : undefined)
        })
    },
    historyTaskDay: (options: {d: Date, task: string}, callback: (result: TReplyHistoryTaskDay | undefined) => void ) => {
        sendToBackend({kind: 'historyTaskDay', task: options.task, d: vv.dateFormat(options.d, 'yyyymmdd'), token: ''}, result => {
            callback(result ? result as TReplyHistoryTaskDay : undefined)
        })
    },
    historyTaskItemView: (options: {type: THistoryTaskItemType, pathTicket: string, fileTicket: string, serverIdxs: string}, callback: (result: TReplyHistoryTaskItemView | undefined) => void ) => {
        sendToBackend({kind: 'historyTaskItemView', type: options.type, pathTicket: options.pathTicket, fileTicket: options.fileTicket, serverIdxs: options.serverIdxs, token: ''}, result => {
            callback(result ? result as TReplyHistoryTaskItemView : undefined)
        })
    },
    historyTaskItemDownload: (options: {type: THistoryTaskItemType, pathTicket: string, fileTicket: string, serverIdxs: string}, callback: (blob: Blob, filename: string) => void ) => {
        sendToBackend({kind: 'historyTaskItemDownload', type: options.type, pathTicket: options.pathTicket, fileTicket: options.fileTicket, serverIdxs: options.serverIdxs, token: ''}, (result, headers) => {
            callback(result, headers ? headers["content-disposition"].split("filename=")[1] : "unknownFile")
        })
    }
}