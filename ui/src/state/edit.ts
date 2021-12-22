import { reactive } from "vue"
import { TDepotMssql } from "../../../src/depotMssql"
import { TDepotTask } from "../../../src/depotTask"
import { send } from "@/core/rest"
import { TReplyEditLoad } from "../../../src/api"
import * as ve from "vv-entity"

export type TMssql = {
    idx: number
    isDel: boolean
    isNew: boolean
    buzyTestConnection: boolean
    lastTestConnectionSuccess: boolean | undefined
    item: ve.TEntity<TDepotMssql>
}

export type TTask = {
    idx: number
    isDel: boolean
    isNew: boolean
    item: ve.TEntity<TDepotTask>
}

const emptyMssql: TDepotMssql = {
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

export const factoryMssql = ve.CreateFactory(emptyMssql)
export const factoryTask = ve.CreateFactory(emptyTask)

export function Load(callback: (mssqls: TMssql[], tasks: TTask[]) => void) {
    send(
        {
            kind: "edit-load",
            token: ""
        },
        result => {
            const r = result as TReplyEditLoad
            let mssqls: TMssql[] = []
            let tasks: TTask[] = []
            if (r) {
                mssqls = (r.data?.mssqls || []).map((m, idx) => {
                    return {
                        idx: idx,
                        isDel: false,
                        isNew: false,
                        buzyTestConnection: false,
                        lastTestConnectionSuccess: undefined,
                        item: factoryMssql.create(m)
                    }
                })
                tasks = (r.data?.tasks || []).map((m, idx) => {
                    return {
                        idx: idx,
                        isDel: false,
                        isNew: false,
                        item: factoryTask.create(m)
                    }
                })
            }
            callback(mssqls, tasks)
        }
    )
}

export function Save(mssqls: TMssql[], tasks: TTask[], callback: (success: boolean) => void) {
    const deletedMssqls = mssqls
        .filter(f => f.isDel === true && f.item.state.file)
        .map(m => {
            return m.item.state
        })
    const deletedTasks = tasks
        .filter(f => f.isDel === true && f.item.state.file)
        .map(m => {
            return m.item.state
        })
    const changedMssqls = mssqls
        .filter(f => f.isNew || f.item.getUpdProps().length > 0)
        .map(m => {
            return m.item.state
        })
    const changedTasks = tasks
        .filter(f => f.isNew || f.item.getUpdProps().length > 0)
        .map(m => {
            return m.item.state
        })

    send(
        {
            kind: "edit-delete",
            token: "",
            data: {
                mssqls: deletedMssqls,
                tasks: deletedTasks
            }
        },
        result => {
            if (!result) {
                callback(false)
                return
            }

            send(
                {
                    kind: "edit-change",
                    token: "",
                    data: {
                        mssqls: changedMssqls,
                        tasks: changedTasks
                    }
                },
                result => {
                    callback(result ? true : false)
                }
            )
        }
    )
}

export function AddMssql(mssqls: TMssql[], source?: TMssql) {
    let idx = 0
    mssqls.forEach(item => {
        if (item.idx > idx) {
            idx = item.idx
        }
    })

    const newItem = factoryMssql.create(source ? source.item : undefined)
    if (source) {
        newItem.state.path = ""
        newItem.state.file = ""
        newItem.state.title = `${newItem.state.title} clone`
    }

    mssqls.push({
        idx: idx + 1,
        isDel: false,
        isNew: true,
        buzyTestConnection: false,
        lastTestConnectionSuccess: undefined,
        item: newItem
    })
}

export function AddTask(tasks: TTask[], source?: TTask) {
    let idx = 0
    tasks.forEach(item => {
        if (item.idx > idx) {
            idx = item.idx
        }
    })

    const newItem = factoryTask.create(source ? source.item : undefined)
    if (source) {
        newItem.state.path = ""
        newItem.state.file = ""
        newItem.state.key = `${newItem.state.key} clone`
        newItem.state.title = `${newItem.state.title} clone`
    }

    tasks.push({
        idx: idx + 1,
        isDel: false,
        isNew: true,
        item: newItem
    })
}

export const state = reactive({
    loadedInit: false,
    buzy: false,
    mssqls: [] as TMssql[],
    tasks: [] as TTask[],
    load: function (callback?: () => void) {
        if (this.buzy) {
            if (callback) callback()
            return
        }
        this.buzy = true
        Load((mssqls, tasks) => {
            this.mssqls = mssqls
            this.tasks = tasks
            this.loadedInit = true
            this.buzy = false
            if (callback) callback()
        })
    },
    save: function (callback?: () => void) {
        if (this.buzy) {
            if (callback) callback()
            return
        }
        this.buzy = true
        Save(this.mssqls, this.tasks, success => {
            if (!success) {
                this.buzy = false
                if (callback) callback()
                return
            }
            Load((mssqls, tasks) => {
                this.mssqls = mssqls
                this.tasks = tasks
                this.loadedInit = true
                this.buzy = false
                if (callback) callback()
            })
        })
    },
    addMssql: function (source?: TMssql) {
        AddMssql(this.mssqls, source)
    },
    addTask: function (source?: TTask) {
        AddTask(this.tasks, source)
    }
})

/*
type TEntity = { idx: number; del: boolean; upd: () => boolean; new: () => boolean }

export type TMssqlEntity = TEntity & {
    load: TDepotMssql | undefined
    edit: TDepotMssql
}

export type TTaskEntity = TEntity & {
    load: TDepotTask | undefined
    edit: TDepotTask
    mates: () => TMssqlEntity[]
}

export const state = reactive({
    loadedInit: false,
    buzy: false,
    load: function (callback?: () => void) {
        if (this.buzy) return
        this.buzy = true
        send(
            {
                kind: "edit-load",
                token: ""
            },
            result => {
                const r = result as TReplyEditLoad
                if (r) {
                    this.mssqls = (r.data?.mssqls || []).map((m, idx) => {
                        const s = JSON.stringify(m)
                        return mssqlEntity(idx, JSON.parse(s), JSON.parse(s))
                    })
                    this.tasks = (r.data?.tasks || []).map((m, idx) => {
                        const s = JSON.stringify(m)
                        return taskEntity(idx, JSON.parse(s), JSON.parse(s), this.mssqls)
                    })
                }
                this.buzy = false
                this.loadedInit = true
                if (callback) {
                    callback()
                }
            }
        )
    },
    delete: function (callback?: (success: boolean) => void) {
        if (this.buzy) return
        this.buzy = true
        send(
            {
                kind: "edit-delete",
                token: "",
                data: {
                    mssqls: this.mssqls
                        .filter(f => f.del === true)
                        .map(m => {
                            return m.edit
                        }),
                    tasks: this.tasks
                        .filter(f => f.del === true)
                        .map(m => {
                            return m.edit
                        })
                }
            },
            result => {
                this.buzy = false
                if (callback) {
                    callback(result ? true : false)
                }
            }
        )
    },
    change: function (callback?: (success: boolean) => void) {
        if (this.buzy) return
        this.buzy = true
        send(
            {
                kind: "edit-change",
                token: "",
                data: {
                    mssqls: this.mssqls
                        .filter(f => f.del !== true && (f.new() || f.upd()))
                        .map(m => {
                            return m.edit
                        }),
                    tasks: this.tasks
                        .filter(f => f.del !== true && (f.new() || f.upd()))
                        .map(m => {
                            return m.edit
                        })
                }
            },
            result => {
                this.buzy = false
                if (callback) {
                    callback(result ? true : false)
                }
            }
        )
    },
    mssqls: [] as TMssqlEntity[],
    tasks: [] as TTaskEntity[],
    maxIdxMssql: function () {
        let idx = 0
        this.mssqls.forEach(item => {
            if (item.idx > idx) {
                idx = item.idx
            }
        })
        return idx
    },
    maxIdxTask: function () {
        let idx = 0
        this.tasks.forEach(item => {
            if (item.idx > idx) {
                idx = item.idx
            }
        })
        return idx
    },
    newMssql: function () {
        return mssqlEntity(this.maxIdxMssql() + 1, undefined, undefined)
    },
    newTask: function () {
        return taskEntity(this.maxIdxTask() + 1, undefined, undefined, this.mssqls)
    }
})

function mssqlEntity(idx: number, load: TDepotMssql | undefined, edit: TDepotMssql | undefined): TMssqlEntity {
    const e: TDepotMssql = edit || {
        path: "",
        file: "",
        title: "",
        instance: "",
        login: "",
        password: "",
        tags: []
    }
    return {
        idx: idx,
        edit: e,
        load: load,
        del: false,
        upd: function () {
            if (!this.load) return false
            return (
                this.load.path !== this.edit.path ||
                this.load.file !== this.edit.file ||
                this.load.title !== this.edit.title ||
                this.load.instance !== this.edit.instance ||
                this.load.password !== this.edit.password ||
                this.load.login !== this.edit.login ||
                JSON.stringify(this.load.tags) !== JSON.stringify(this.edit.tags)
            )
        },
        new: function () {
            return this.load ? false : true
        }
    }
}

function taskEntity(idx: number, load: TDepotTask | undefined, edit: TDepotTask | undefined, mateEntity: TMssqlEntity[]): TTaskEntity {
    const e: TDepotTask = edit || {
        path: "",
        file: "",
        key: "",
        title: "",
        allowExec: false,
        allowMessages: false,
        allowRows: false,
        metronom: {
            kind: "cron",
            cron: "0 0 * * * *"
        },
        mssqls: {
            instances: [],
            tags: []
        },
        queries: []
    }
    return {
        idx: idx,
        edit: e,
        load: load,
        del: false,
        upd: function () {
            if (!this.load) return false
            return (
                this.load.path !== this.edit.path ||
                this.load.file !== this.edit.file ||
                this.load.key !== this.edit.key ||
                this.load.title !== this.edit.title ||
                this.load.allowMessages !== this.edit.allowMessages ||
                this.load.allowRows !== this.edit.allowRows ||
                JSON.stringify(this.load.metronom) !== JSON.stringify(this.edit.metronom) ||
                JSON.stringify(this.load.mssqls) !== JSON.stringify(this.edit.mssqls) ||
                JSON.stringify(this.load.queries) !== JSON.stringify(this.edit.queries)
            )
        },
        new: function () {
            return this.load ? false : true
        },
        mates: function () {
            const m: TMssqlEntity[] = []
            if (!mateEntity) {
                return []
            }
            mateEntity.forEach(e => {
                if (m.includes(e)) return
                if (this.edit.mssqls.instances.some(f => vv.equal(f, e.edit.instance))) {
                    m.push(e)
                    return
                }
                if (e.edit.tags.some(f => this.edit.mssqls.tags.some(ff => vv.equal(f, ff)))) {
                    m.push(e)
                    return
                }
            })
            return m
        }
    }
}
*/
