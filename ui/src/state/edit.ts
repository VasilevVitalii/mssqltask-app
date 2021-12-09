import { reactive } from "vue"
import { TDepotMssql } from "../../../src/depotMssql"
import { TDepotTask } from "../../../src/depotTask"
import { send } from "@/core/rest"
import { TReplyEditLoad } from "../../../src/console"

type TEntity = { deleted: boolean; changed: () => boolean }

export type TMssqlEntity = TEntity & {
    load: TDepotMssql
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
                    this.mssqls = (r.data?.mssqls || []).map(m => {
                        const s = JSON.stringify(m)
                        return {
                            edit: JSON.parse(s) as TDepotMssql,
                            load: JSON.parse(s) as TDepotMssql,
                            deleted: false,
                            changed: function () {
                                return (
                                    this.load.path !== this.edit.path ||
                                    this.load.file !== this.edit.file ||
                                    this.load.instance !== this.edit.instance ||
                                    this.load.password !== this.edit.password ||
                                    this.load.login !== this.edit.login ||
                                    JSON.stringify(this.load.tags) !== JSON.stringify(this.edit.tags)
                                )
                            }
                        }
                    })

                    this.tasks = (r.data?.tasks || []).map(m => {
                        const s = JSON.stringify(m)
                        return {
                            edit: JSON.parse(s) as TDepotTask,
                            load: JSON.parse(s) as TDepotTask,
                            deleted: false,
                            changed: function () {
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
    tasks: [] as TTaskEntity[]
})
