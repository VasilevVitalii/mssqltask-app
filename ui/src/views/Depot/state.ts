import { reactive } from "vue"
import * as vv from "vv-common"
import * as env from "@/core/_env"
import * as ve from "vv-entity"
import { TDepotMssql } from "../../../../src/depotMssql"
import { TDepotTask } from "../../../../src/depotTask"
import { TReplyDepotLoad } from "../../../../src/api/onPost"

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

const list = (data: TReplyDepotLoad | undefined): {servers: TServer[], tasks: TTask[]} => {
    return {
        servers: (data?.mssqls || []).map((m,i) => {
            return {
                idx: i,
                isNew: false,
                isDel: false,
                buzyTestConnection: false,
                lastTestConnectionResult: undefined,
                lastTestConnectionMessage: undefined,
                item: factoryServer.create(m)
            }
        }),
        tasks: (data?.tasks || []).map((m,i) => {
            return {
                idx: i,
                isNew: false,
                isDel: false,
                buzyTestConnection: false,
                lastTestConnectionSuccess: undefined,
                item: factoryTask.create(m)
            }
        })
    }
}

export const state = reactive({
    data: {
        buzy: false,
        countLoad: 0,
        viewBy: "task",
        servers: [] as TServer[],
        tasks: [] as TTask[],
        serverFilter: '',
        taskFilter: '',
        taskLinkFilter: ''
    },
    func: {
        load: (callback?: () => void) => {
            if (state.data.buzy) {
                if (callback) callback()
                return
            }
            state.data.buzy = true
            env.api.depotLoad(result => {

                const d = list(result)
                state.data.servers = d.servers
                state.data.tasks = d.tasks

                if (result) state.data.countLoad++
                state.data.buzy = false
                if (callback) callback()
            })
        },
        hasChanges: (): boolean => {
            if (state.data.servers.some(f => f.isNew || f.isDel)) return true
            if (state.data.tasks.some(f => f.isNew || f.isDel)) return true
            if (state.data.servers.some(f => f.item.getUpdProps().length > 0)) return true
            if (state.data.tasks.some(f => f.item.getUpdProps().length > 0)) return true
            return false
        },
        save: (callback?: (needSave?: boolean) => void) => {
            if (state.data.buzy) {
                if (callback) callback()
                return
            }
            state.data.buzy = true

            const forDelete = {
                mssqls: state.data.servers.filter(f => f.isDel && f.item.state.file).map(m => { return {path: m.item.state.path || '', file: m.item.state.file || ''} }),
                tasks: state.data.tasks.filter(f => f.isDel && f.item.state.file).map(m => { return {path: m.item.state.path || '', file: m.item.state.file || ''} })
            }
            const forUpsert = {
                mssqls: state.data.servers.filter(f => f.isNew || f.item.getUpdProps().length > 0).map(m => { return m.item.state }),
                tasks: state.data.tasks.filter(f => f.isNew || f.item.getUpdProps().length > 0).map(m => { return m.item.state }),
            }

            if (forDelete.mssqls.length <= 0 && forDelete.tasks.length <= 0 && forUpsert.mssqls.length <= 0 && forUpsert.tasks.length <= 0) {
                state.data.buzy = false
                if (callback) callback(false)
                return
            }
            env.api.depotSave({delete: forDelete, upsert: forUpsert}, result => {
                const d = list(result)
                state.data.servers = d.servers
                state.data.tasks = d.tasks

                if (result) state.data.countLoad++
                state.data.buzy = false
                if (callback) callback(true)
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
            },
            addMssqlsTag(source: TTask, tag: string) {
                if (source.item.state.mssqls.tags.some(f => vv.equal(f, tag))) return
                source.item.state.mssqls.tags.push(tag)
            },
            delMssqlsTag(source: TTask, tag: string) {
                source.item.state.mssqls.tags = source.item.state.mssqls.tags.filter(f => !vv.equal(f, tag))
            },
            addMssqlsInstance(source: TTask, instance: string) {
                if (source.item.state.mssqls.instances.some(f => vv.equal(f, instance))) return
                source.item.state.mssqls.instances.push(instance)
            },
            delMssqlsInstance(source: TTask, instance: string) {
                source.item.state.mssqls.instances = source.item.state.mssqls.instances.filter(f => !vv.equal(f, instance))
            }
        },

    }
})