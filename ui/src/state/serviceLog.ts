import { reactive } from "vue"
import * as vv from "vv-common"
import { send } from "@/core/rest"
import { TReplyHistoryServiceLog, TReplyHistoryServiceLogItem } from "./../../../src/api"
import { TFileHistoryServiceLog } from "./../../../src/api/serviceLog"

//https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries?rq=1

type TFile = {
    state: TFileHistoryServiceLog
    buzy: boolean
    allowReload: boolean
    textError?: string | undefined
    textDebug?: string | undefined
    textTrace?: string | undefined
}

export function Load(d1: Date, d2: Date, callback: (files: TFileHistoryServiceLog[]) => void) {
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
            callback(r?.data?.files || [])
        }
    )
}

export function Loadtext(d: Date, kind: "error" | "debug" | "trace", callback: (text: string) => void) {
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

export const state = reactive({
    loadedInit: false,
    buzy: false,
    files: [] as TFile[],
    text: {
        item: undefined as TFile | undefined,
        kind: "error" as "error" | "debug" | "trace"
    },
    load: function (d1: Date, d2: Date, callback?: () => void) {
        if (this.buzy) {
            if (callback) callback()
            return
        }
        if (this.files.some(f => f.buzy)) {
            if (callback) callback()
            return
        }
        this.buzy = true
        this.text.item = undefined
        Load(d1, d2, files => {
            const now = vv.dateFormat(new Date(), "yyyymmdd")
            this.files = files.map(m => {
                return {
                    state: m,
                    buzy: false,
                    allowReload: vv.dateFormat(vv.toDate(m.dd) || new Date(2000, 1, 1), "yyyymmdd") === now
                }
            })
            this.loadedInit = true
            this.buzy = false
            if (callback) callback()
        })
    },
    reload: function (item: TFile, callback?: () => void) {
        if (this.buzy || item.buzy) {
            if (callback) callback()
            return
        }
        const d = vv.toDate(item.state.dd)
        if (!d) {
            if (callback) callback()
            return
        }
        item.buzy = true
        Load(d, d, files => {
            const fnd = files.find(f => f.dd === item.state.dd)
            if (fnd) {
                item.state = fnd
                item.textError = undefined
                item.textDebug = undefined
                item.textTrace = undefined
            }
            item.buzy = false
            if (callback) callback()
        })
    },
    loadText: function (item: TFile, kind: "error" | "debug" | "trace", callback?: () => void) {
        if (this.buzy || item.buzy) {
            if (callback) callback()
            return
        }
        const d = vv.toDate(item.state.dd)
        if (!d) {
            if (callback) callback()
            return
        }
        item.buzy = true
        Loadtext(d, kind, text => {
            if (kind === "error") {
                item.textError = text
            } else if (kind === "debug") {
                item.textDebug = text
            } else if (kind === "trace") {
                item.textTrace = text
            }
            item.buzy = false
            if (callback) callback()
        })
    }
})
