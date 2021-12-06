import { reactive } from "vue"
import { TDepotMssql } from "../../../src/depotMssql"
import { TDepotTask } from "../../../src/depotTask"
import { post, tokenGet } from "@/router"

export type TMssql = {
    deleted: boolean
    changed: () => boolean
    load: { path: string; file: string; data: TDepotMssql }[]
    edit: { path: string; file: string; data: TDepotMssql }[]
}

export type TTask = {
    deleted: boolean
    changed: () => boolean
    load: { path: string; file: string; data: TDepotTask }[]
    edit: { path: string; file: string; data: TDepotTask }[]
}

export const state = reactive({
    tryLoaded: false,
    loading: false,
    loadErrorText: undefined as string | undefined,
    load: async function () {
        if (this.loading) return
        this.loading = true
        const res = await post({
            kind: "edit-load",
            token: tokenGet()
        })
        this.loadErrorText = res.errorText
        this.loading = false
        this.tryLoaded = true
    },
    mssqls: [] as TMssql[],
    tasks: [] as TTask[]
})
