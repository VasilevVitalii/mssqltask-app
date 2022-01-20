import { reactive } from "vue"
import * as vv from "vv-common"
import { send } from "@/core/rest"
import { TReplyHistoryServiceLog, TReplyHistoryServiceLogItem } from "./../../../src/api"
import { TFileHistoryServiceLog } from "./../../../src/api/serviceLog"

function Load(d1: Date, d2: Date, callback: (items: TFileHistoryServiceLog[]) => void) {
    send(
        {
            kind: "history-service-log",
            token: "",
            data: {
                dd1: vv.dateFormat(d1, "yyyymmdd"),
                dd2: vv.dateFormat(d2, "yyyymmdd")
            }
        },
        result => {
            const r = result as TReplyHistoryServiceLog
            callback(r?.data?.days || [])
        }
    )
}

function LoadText(d: Date, kind: "error" | "debug" | "trace", callback: (text: string) => void) {
    send(
        {
            kind: "history-service-log-item",
            token: "",
            data: {
                dd: vv.dateFormat(d, "yyyymmdd"),
                kind: kind
            }
        },
        result => {
            const r = result as TReplyHistoryServiceLogItem
            callback(r?.data?.text || "EMPTY FILE")
        }
    )
}

function Download(d: Date, kind: "error" | "debug" | "trace", callback: (blob: Blob, filename: string) => void) {
    send(
        {
            kind: "history-service-log-item-download",
            token: "",
            data: {
                dd: vv.dateFormat(d, "yyyymmdd"),
                kind: kind
            }
        },
        (result, headers) => {
            callback(result, headers ? headers["content-disposition"].split("filename=")[1] : "unknownFile")
        }
    )
}

export const state = reactive({
    loadedInit: false,
    buzy: false,
    days: [] as TFileHistoryServiceLog[],
    text: {
        item: undefined as TFileHistoryServiceLog | undefined,
        text: "",
        kind: "error" as "error" | "debug" | "trace"
    },
    load: function (callback?: () => void) {
        if (this.buzy) {
            if (callback) callback()
            return
        }
        const d2 = new Date()
        const d1 = vv.dateAdd(d2, "day", -30) as Date
        this.buzy = true
        this.text.item = undefined
        Load(d1, d2, days => {
            this.days = days
            this.loadedInit = true
            this.buzy = false
            if (callback) callback()
        })
    },
    loadText: function (item: TFileHistoryServiceLog, kind: "error" | "debug" | "trace", callback?: () => void) {
        if (this.buzy) {
            if (callback) callback()
            return
        }
        const d = vv.toDate(item.dd)
        if (!d) {
            if (callback) callback()
            return
        }
        this.buzy = true
        LoadText(d, kind, text => {
            this.text.text = text
            this.text.kind = kind
            this.text.item = item
            this.buzy = false
            if (callback) callback()
        })
    },
    download: function (
        item: TFileHistoryServiceLog,
        kind: "error" | "debug" | "trace",
        callback: (blob: Blob | undefined, fileName: string | undefined) => void
    ) {
        if (this.buzy) {
            if (callback) callback(undefined, undefined)
            return
        }
        const d = vv.toDate(item.dd)
        if (!d) {
            if (callback) callback(undefined, undefined)
            return
        }
        Download(d, kind, (blob, fileName) => {
            if (callback) callback(blob, fileName)
        })
    }
})
