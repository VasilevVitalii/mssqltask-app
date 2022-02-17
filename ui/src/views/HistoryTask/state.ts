import { reactive } from "vue"
import * as vv from "vv-common"
import * as env from "@/core/_env"
import { TTicketResult } from "mssqltask"
import { TReplyHistoryTaskDayData } from "../../../../src/api/onPost"

export type TTaskServiceStat = {idx: number, path: string, file: string, dateStart: Date, dateStop: Date, duration: number, data: TReplyHistoryTaskDayData, hasError: boolean}
export type TTaskService = {d: Date, task: string, stat: TTaskServiceStat[], hasError: () => boolean}
type TTaskServiceByTask = {task: string, items: TTaskService[]}
type TTaskServiceByDate = {d: Date, items: TTaskService[]}

export const state = reactive({
    data: {
        buzy: false,
        countLoad: 0,
        viewBy: "date",
        itemsByTask: [] as TTaskServiceByTask[],
        itemsByDate: [] as TTaskServiceByDate[],
        itemView: undefined as TTaskService | undefined,
        itemFilter: '',
    },
    func: {
        load: (callback?: () => void) => {
            if (state.data.buzy) {
                if (callback) callback()
                return
            }
            state.data.buzy = true
            state.data.itemView = undefined
            const d2 = new Date()
            const d1 = vv.dateAdd(d2, "day", -30) as Date
            env.api.historyTaskList({d1, d2}, result => {
                const itemsByTask: TTaskServiceByTask[] = []
                const itemsByDate: TTaskServiceByDate[] = []
                if (result && result.map) {
                    result.map.forEach(m => {
                        const d = vv.toDate(m.d)
                        if (!d) return

                        const obj: TTaskService = {
                            d: d,
                            task: m.task,
                            stat: [],
                            hasError: function(): boolean {
                                return this.stat.some(f => f.hasError)
                            }
                        }

                        let fndByTask = itemsByTask.find(f => f.task === obj.task)
                        if (!fndByTask) {
                            fndByTask = {task: obj.task, items: []}
                            itemsByTask.push(fndByTask)
                        }
                        fndByTask.items.push(obj)

                        let fndByDate = itemsByDate.find(f => vv.equal(f.d, obj.d))
                        if (!fndByDate) {
                            fndByDate = {d: obj.d, items: []}
                            itemsByDate.push(fndByDate)
                        }
                        fndByDate.items.push(obj)
                    })
                    state.data.countLoad++
                }
                itemsByTask.forEach(i => {
                    i.items = i.items.sort((a, b) => {
                        if (a.d.getTime() > b.d.getTime()) return -1
                        if (a.d.getTime() < b.d.getTime()) return 1
                        return 0
                    })
                })
                itemsByDate.forEach(i => {
                    i.items = i.items.sort((a, b) => {
                        if (a.task > b.task) return 1
                        if (a.task < b.task) return -1
                        return 0
                    })
                })

                state.data.itemsByTask = itemsByTask.sort((a, b) => {
                    if (a.task > b.task) return 1
                    if (a.task < b.task) return -1
                    return 0
                })
                state.data.itemsByDate = itemsByDate.sort((a, b) => {
                    if (a.d.getTime() > b.d.getTime()) return -1
                    if (a.d.getTime() < b.d.getTime()) return 1
                    return 0
                })
                state.data.buzy = false
                if (callback) callback()
            })
        },
        loadStat: (items: TTaskService[], callback?: () => void) => {
            if (state.data.buzy) {
                if (callback) callback()
                return
            }
            state.data.buzy = true

            const requests = items.map(m => { return {item: m, isCallback: false} })

            let timer = setTimeout(function tick() {
                if (requests.some(f => !f.isCallback)) {
                    timer = setTimeout(tick, 200)
                    return
                }
                state.data.buzy = false
                if (callback) {
                    callback()
                }
            }, 200)

            requests.forEach(r => {
                env.api.historyTaskDay({d: r.item.d, task: r.item.task}, result => {
                    const stat: TTaskServiceStat[] = (result?.files || []).map((m,i) => {
                        return {
                            idx: i,
                            path: m.path,
                            file: m.file,
                            duration: 0,
                            dateStart: vv.toDate(m.data.dateStart) as any,
                            dateStop: vv.toDate(m.data.dateStop) as any,
                            data: m.data,
                            hasError: m.data.servers.some(f => f.execError)
                        }
                    })
                    stat.forEach(item => item.duration = item.dateStop.getTime() - item.dateStart.getTime())

                    r.item.stat = stat.sort((a, b) => {
                        const aa = a.dateStart.getTime()
                        const bb = b.dateStart.getTime()
                        if (aa > bb) return -1
                        if (aa < bb) return 1
                        return 0
                    })
                    r.isCallback = true
                })
            })
        }
    }
})
