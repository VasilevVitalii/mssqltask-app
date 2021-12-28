import { reactive } from "vue"
import * as vv from "vv-common"
import { send } from "@/core/rest"
import { TReplyHistoryTaskLog, TReplyHistoryTaskLogTickets } from "./../../../src/api"
import { TFileHistoryTaskLog, TFileHistoryTaskLogTickets } from "./../../../src/api/taskLog"

type TTickets = TFileHistoryTaskLogTickets & { duration: number; durationText: string }

export function Load(d1: Date, d2: Date, callback: (items: TFileHistoryTaskLog[]) => void) {
    send(
        {
            kind: "history-task-log",
            token: "",
            data: {
                dd1: vv.dateFormat(d1, "yyyymmdd"),
                dd2: vv.dateFormat(d2, "yyyymmdd")
            }
        },
        result => {
            const r = result as TReplyHistoryTaskLog
            callback(r?.data?.tasks || [])
        }
    )
}

export function LoadTickets(task: string, d: Date, callback: (items: TFileHistoryTaskLogTickets[]) => void) {
    send(
        {
            kind: "history-task-log-tickets",
            token: "",
            data: {
                task: task,
                dd: vv.dateFormat(d, "yyyymmdd")
            }
        },
        result => {
            const r = result as TReplyHistoryTaskLogTickets
            callback(r?.data?.tickets || [])
        }
    )
}

// export function LoadText(d: Date, kind: "error" | "debug" | "trace", callback: (text: string) => void) {
//     send(
//         {
//             kind: "history-service-log-item",
//             token: "",
//             data: {
//                 dd: vv.dateFormat(d, "yyyymmdd"),
//                 kind: kind
//             }
//         },
//         result => {
//             const r = result as TReplyHistoryServiceLogItem
//             callback(r?.data?.text || "EMPTY FILE")
//         }
//     )
// }

// export function Download(d: Date, kind: "error" | "debug" | "trace", callback: (blob: Blob, filename: string) => void) {
//     send(
//         {
//             kind: "history-service-log-item-download",
//             token: "",
//             data: {
//                 dd: vv.dateFormat(d, "yyyymmdd"),
//                 kind: kind
//             }
//         },
//         (result, headers) => {
//             callback(result, headers ? headers["content-disposition"].split("filename=")[1] : "unknownFile")
//         }
//     )
// }

export const state = reactive({
    loadedInit: false,
    buzy: false,
    tasks: [] as TFileHistoryTaskLog[],
    tickets: {
        task: undefined as TFileHistoryTaskLog | undefined,
        d: undefined as Date | undefined,
        list: [] as TTickets[]
    },
    load: function (d1: Date, d2: Date, callback?: () => void) {
        if (this.buzy) {
            if (callback) callback()
            return
        }
        this.buzy = true
        this.tickets = {
            task: undefined,
            d: undefined,
            list: []
        }
        Load(d1, d2, tasks => {
            this.tasks = tasks
            this.loadedInit = true
            this.buzy = false
            if (callback) callback()
        })
    },
    loadTickets: function (task: TFileHistoryTaskLog, d: string, callback?: () => void) {
        if (this.buzy) {
            if (callback) callback()
            return
        }
        this.buzy = true
        const dd = vv.toDate(d) || new Date(2000, 1, 1)
        LoadTickets(task.task, dd, tickets => {
            this.buzy = false
            this.tickets = {
                task: task,
                d: dd,
                list: tickets.map(m => {
                    return { ...m, ...duration(m.result?.dateStop, m.result?.dateStart) }
                })
            }
            if (callback) callback()
        })
    }
    /*,
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
    }*/
})

function duration(dateStop: string, dateStart: string): { duration: number; durationText: string } {
    const result = {
        duration: 0,
        durationText: ""
    }

    const d1 = vv.toDate(dateStop)
    const d2 = vv.toDate(dateStart)
    if (!d1 || !d2) {
        return result
    }

    const msec = d1.getTime() - d2.getTime()
    if (msec <= 0) {
        return result
    }

    result.duration = msec

    const borderMsec = 1000 * 5 //5 sec
    const borderSec = 1000 * 60 //1 min
    const borderMin = 1000 * 60 * 60 //1 hour
    const borderHour = 3600000 * 10 //10 hour

    if (msec < borderMsec) {
        result.durationText = `${msec} msec`
    } else if (msec < borderSec) {
        result.durationText = `${Math.round(msec / 1000)} sec`
    } else if (msec < borderMin) {
        result.durationText = `${Math.round(msec / 1000 / 60)} min`
    } else if (msec <= borderHour) {
        const hours = Math.floor(msec / 1000 / 60 / 60)
        const mins = Math.round((msec - hours * 1000 * 60 * 60) / 1000 / 60)
        result.durationText = `${hours} hour ${mins} min`
    } else {
        const days = Math.floor(msec / 1000 / 60 / 60 / 24)
        const hours = Math.round((msec - days * 1000 * 60 * 60 * 24) / 1000 / 60 / 60)
        result.durationText = `${days} day ${hours} hour`
    }
    return result
}
