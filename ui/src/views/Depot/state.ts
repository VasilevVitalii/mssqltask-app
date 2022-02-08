import { reactive } from "vue"
import * as vv from "vv-common"
import * as env from "@/core/_env"
import * as ve from "vv-entity"
import { TDepotMssql } from "../../../../src/depotMssql"
import { TDepotTask } from "../../../../src/depotTask"

export type TServer = {
    idx: number
    isDel: boolean
    isNew: boolean
    buzyTestConnection: boolean
    lastTestConnectionResult: boolean | undefined,
    lastTestConnectionMessage: string | undefined,
    item: ve.TEntity<TDepotMssql>
}

export type TTask = {
    idx: number
    isDel: boolean
    isNew: boolean
    item: ve.TEntity<TDepotTask>
}

const emptyServer: TDepotMssql = {
    path: "",
    file: "",
    title: "",
    instance: "",
    login: "",
    password: "",
    tags: []
}

const emptyTask: TDepotTask = {
    path: "",
    file: "",
    key: "",
    title: "",
    metronom: {
        kind: "cron",
        cron: "0 */1 * * * *"
    },
    queries: [],
    allowExec: false,
    allowRows: false,
    allowMessages: false,
    mssqls: {
        instances: [],
        tags: []
    }
}

const factoryServer = ve.CreateFactory(emptyServer, [{prop: 'path', func: () => ''}, {prop: 'file', func: () => ''}])
const factoryTask = ve.CreateFactory(emptyTask)

export const state = reactive({
    data: {
        buzy: false,
        countLoad: 0,
        viewBy: "task",
        servers: [] as TServer[],
        tasks: [] as TTask[],
    },
    func: {
        load: (callback?: () => void) => {
            if (state.data.buzy) {
                if (callback) callback()
                return
            }
            state.data.buzy = true
            env.api.depotLoad(result => {
                state.data.servers = (result?.mssqls || []).map((m,i) => {
                    return {
                        idx: i,
                        isNew: false,
                        isDel: false,
                        buzyTestConnection: false,
                        lastTestConnectionResult: undefined,
                        lastTestConnectionMessage: undefined,
                        item: factoryServer.create(m)
                    }
                })
                state.data.tasks = (result?.tasks || []).map((m,i) => {
                    return {
                        idx: i,
                        isNew: false,
                        isDel: false,
                        buzyTestConnection: false,
                        lastTestConnectionSuccess: undefined,
                        item: factoryTask.create(m)
                    }
                })
                if (result) state.data.countLoad++
                state.data.buzy = false
                if (callback) callback()
            })
        },
        server: {
            add(source?: TServer) {
                let idx = 0
                state.data.servers.forEach(item => {
                    if (item.idx > idx) {
                        idx = item.idx
                    }
                })
                state.data.servers.push({
                    idx: idx + 1,
                    isDel: false,
                    isNew: true,
                    buzyTestConnection: false,
                    lastTestConnectionResult: undefined,
                    lastTestConnectionMessage: undefined,
                    item: factoryServer.create(source ? source.item : undefined)
                })
            },
            del(source: TServer) {
                source.isDel = true
            },
            undoEdit(source: TServer) {
                source.item.undo()
            },
            undoAdd(source: TServer) {
                if (!source.isNew) return
                state.data.servers = state.data.servers.filter(f => f !== source)
            },
            undoDel(source: TServer) {
                source.isDel = false
            },
            testConnection(source: TServer, callback: (hasReply: boolean) => void) {
                if (source.buzyTestConnection) {
                    callback(false)
                    return
                }
                source.buzyTestConnection = true
                env.api.depotTestConnection({
                    instance: source.item.state.instance,
                    login: source.item.state.login,
                    password: source.item.state.password,
                    passwordFromDepot: source.item.state.file && !source.item.state.password ? {path: source.item.state.path || '', file: source.item.state.file} : undefined
                }, result => {
                    source.buzyTestConnection = false
                    if (!result) {
                        callback(false)
                        return
                    }
                    source.lastTestConnectionResult = result.result
                    source.lastTestConnectionMessage = result.resultText
                    callback(true)
                })
            }
        },
        task: {
            add(source?: TTask) {
                let idx = 0
                state.data.tasks.forEach(item => {
                    if (item.idx > idx) {
                        idx = item.idx
                    }
                })
                state.data.tasks.push({
                    idx: idx + 1,
                    isDel: false,
                    isNew: true,
                    item: factoryTask.create(source ? source.item : undefined)
                })
            },
            del(source: TTask) {
                source.isDel = true
            },
            undoEdit(source: TTask) {
                source.item.undo()
            },
            undoAdd(source: TTask) {
                if (!source.isNew) return
                state.data.tasks = state.data.tasks.filter(f => f !== source)
            },
            undoDel(source: TTask) {
                source.isDel = false
            },
            addQuery(source: TTask) {
                source.item.state.queries.push('')
            },
            delQuery(source: TTask, idx: number) {
                source.item.state.queries.splice(idx, 1)
            }
        },

    }
})