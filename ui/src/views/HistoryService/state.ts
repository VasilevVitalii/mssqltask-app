import { reactive } from "vue"
import * as vv from "vv-common"
import * as env from "@/core/_env"

export type THistoryService = {d: Date, fileError?: string, sizeError?: number, fileDebug?: string, sizeDebug?: number, fileTrace?: string, sizeTrace?: number}

const state = reactive({
    data: {
        buzy: false,
        countLoad: 0,
        items: [] as THistoryService[],
        view: undefined as {type: string, text: string, countLines: number, item: THistoryService} | undefined
    },
    func: {
        load: (callback?: () => void) => {
            if (state.data.buzy) {
                if (callback) callback()
                return
            }
            state.data.buzy = true
            const d2 = new Date()
            const d1 = vv.dateAdd(d2, "day", -30) as Date
            env.api.historyServiceList({d1, d2}, result => {
                const items: THistoryService[] = []
                if (result && result.files) {
                    result.files.forEach(f => {
                        const d = vv.toDate(f.d)
                        if (!d) return
                        let fnd = items.find(f => vv.equal(f.d, d))
                        if (!fnd) {
                            fnd = {
                                d: d,
                            }
                            items.push(fnd)
                        }
                        if (f.type === 'error') {
                            fnd.fileError = f.file
                            fnd.sizeError = f.size
                        } else if (f.type === 'debug') {
                            fnd.fileDebug = f.file
                            fnd.sizeDebug = f.size
                        } else if (f.type === 'trace') {
                            fnd.fileTrace = f.file
                            fnd.sizeTrace = f.size
                        }
                    })
                    state.data.countLoad++
                }
                state.data.items = items.sort((a, b) => {
                    if (a.d > b.d) return -1
                    if (a.d < b.d) return 1
                    return 0
                })
                state.data.buzy = false
                if (callback) callback()
            })
        },
        view: (type: string, item: THistoryService, callback?: () => void) => {
            if (state.data.buzy) {
                if (callback) callback()
                return
            }
            const borderSize = 1000 * 1000 * 5 // 5 mb
            const size = type === 'error' ? item.sizeError || 0 : type === 'debug' ? item.sizeDebug || 0 : type === 'trace' ? item.sizeTrace || 0 : 0
            if (borderSize < size) {
                env.dialogNotify('warn', 'this file is big for view')
                if (callback) callback()
                return
            }
            const file = type === 'error' ? item.fileError : type === 'debug' ? item.fileDebug : type === 'trace' ? item.fileTrace : ''
            if (!file) {
                if (callback) callback()
                return
            }
            state.data.buzy = true
            env.api.historyServiceItemView({file: file}, result => {
                if (result) {
                    const textArr = result.text.split('\n')
                    state.data.view = {
                        item: item,
                        type: type,
                        text: textArr.join('\n'),
                        countLines: textArr.filter(f => f.trim().length > 0).length
                    }
                } else {
                    state.data.view = undefined
                }
                state.data.buzy = false
                if (callback) callback()
            })
        }
    }

})
export default state