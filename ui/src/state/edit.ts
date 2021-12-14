import { reactive } from "vue"
import { TDepotMssql } from "../../../src/depotMssql"
import { TDepotTask } from "../../../src/depotTask"
import { send } from "@/core/rest"
import { TReplyEditLoad } from "../../../src/api"
import * as vv from "vv-common"

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
    delete: function (callback?: () => void) {
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
            () => {
                this.buzy = false
                if (callback) {
                    callback()
                }
            }
        )
    },
    change: function (callback?: () => void) {
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
            () => {
                this.buzy = false
                if (callback) {
                    callback()
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
        allowMessages: false,
        allowRows: false,
        metronom: {
            kind: "cron",
            cron: "0 */1 * * * *"
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
