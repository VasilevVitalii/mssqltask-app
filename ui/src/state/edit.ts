import { reactive } from "vue"
import { TDepotMssql } from "../../../src/depotMssql"
import { TDepotTask } from "../../../src/depotTask"
import { send } from "@/core/rest"
import { TReplyEditLoad } from "../../../src/console"

type TEntity = { idx: number; del: boolean; upd: () => boolean; new: () => boolean }

export type TMssqlEntity = TEntity & {
    load: TDepotMssql | undefined
    edit: TDepotMssql
}

export type TTaskEntity = TEntity & {
    load: TDepotTask
    edit: TDepotTask
}

export const state = reactive({
    loadedInit: false,
    loading: false,
    load: async function () {
        if (this.loading) return
        this.loading = true
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
                        return {
                            idx: idx,
                            edit: JSON.parse(s) as TDepotTask,
                            load: JSON.parse(s) as TDepotTask,
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
                            }
                        }
                    })
                }
                this.loading = false
                this.loadedInit = true
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
    newMssql: function () {
        return mssqlEntity(this.maxIdxMssql() + 1, undefined, undefined)
    }
})

function mssqlEntity(idx: number, load: TDepotMssql | undefined, edit: TDepotMssql | undefined): TMssqlEntity {
    const e = edit || {
        path: "",
        file: "",
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
