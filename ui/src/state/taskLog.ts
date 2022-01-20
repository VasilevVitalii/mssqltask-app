import { reactive } from "vue"
import * as vv from "vv-common"
import { send } from "@/core/rest"
import { TReplyHistoryTaskLog, TReplyHistoryTaskLogTickets } from "./../../../src/api"
import { TFileHistoryTaskLog, TFileHistoryTaskLogTickets } from "./../../../src/api/taskLog"

type TTickets = TFileHistoryTaskLogTickets & { duration: number; durationText: string; countExecSuccess: number; countExecError: number; existsRow: boolean; existsMsg: boolean}

function Load(d1: Date, d2: Date, callback: (items: TFileHistoryTaskLog[]) => void) {
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

function LoadTickets(task: string, d: Date, callback: (items: TFileHistoryTaskLogTickets[]) => void) {
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
            callback((r.data?.tickets || []).sort((a, b) => {
                if (a.result.dateStart > b.result.dateStart) return -1
                if (a.result.dateStart < b.result.dateStart) return 1
                if (a.result.dateStop > b.result.dateStop) return -1
                if (a.result.dateStop < b.result.dateStop) return 1
                return 0
            }))
        }
    )
}

export const state = reactive({
    loadedInit: false,
    buzy: false,
    tasks: [] as TFileHistoryTaskLog[],
    dayTasks: [] as string[],
    tickets: {
        task: undefined as TFileHistoryTaskLog | undefined,
        d: undefined as Date | undefined,
        list: [] as TTickets[]
    },
    load: function (callback?: () => void) {
        if (this.buzy) {
            if (callback) callback()
            return
        }
        const d2 = new Date()
        const d1 = vv.dateAdd(d2, "day", -30) as Date
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
                    return {
                        ...m,
                        ...duration(m.result?.dateStop, m.result?.dateStart),
                        countExecSuccess: m.result?.servers.filter(f => !f.execError).length || 0,
                        countExecError: m.result?.servers.filter(f => f.execError).length || 0,
                        existsRow: m.result?.servers.some(f => f.countRows > 0),
                        existsMsg: m.result?.servers.some(f => f.countMessages > 0),
                    }
                })
            }
            if (callback) callback()
        })
    },
    download: function (kind: "ticket" | "row" | "msg", idxs: string, tiketFileName: string, callback: (blob: Blob | undefined, filename: string) => void) {
        if (!this.tickets.d || !this.tickets.task) {
            callback(undefined, "")
            return
        }
        send(
            {
                kind: "history-task-log-file-download",
                token: "",
                data: {
                    kind: kind,
                    idxs: idxs,
                    dd: vv.dateFormat(this.tickets.d, "yyyymmdd"),
                    task: this.tickets.task?.task,
                    tiketFileName: tiketFileName
                }
            },
            (result, headers) => {
                callback(result, headers ? headers["content-disposition"].split("filename=")[1] : "unknownFile")
            }
        )
    }
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
    const parts = vv.dateParts(msec)
    if (parts.day > 0) {
        if (parts.minute > 30) parts.hour++
        result.durationText = `${with0(parts.day, 2)} day ${with0(parts.hour, 2)} hour`
    } else if (parts.hour > 0) {
        if (parts.second > 30) parts.minute++
        result.durationText = `${with0(parts.hour, 2)} hour ${with0(parts.minute, 2)} min`
    } else if (parts.minute > 5) {
        if (parts.second > 30) parts.minute++
        result.durationText = `${with0(parts.minute, 2)} min`
    } else if (parts.minute > 0) {
        if (parts.millisecond > 500) parts.second++
        result.durationText = `${with0(parts.minute, 2)} min ${with0(parts.second, 2)} sec`
    } else if (parts.second > 5) {
        if (parts.millisecond > 500) parts.second++
        result.durationText = `${with0(parts.second, 2)} sec`
    } else if (parts.second > 0) {
        result.durationText = `${with0(parts.second, 2)} sec ${with0(parts.millisecond, 3)} msec`
    } else {
        result.durationText = `${with0(parts.millisecond, 3)} msec`
    }

    return result
}

function with0(s: string | number, maxLen: number): string {
    const ss = typeof s === "string" ? s : s.toString()
    if (ss.length >= maxLen) return ss
    return `${ss.padStart(maxLen, "0")}`
}
