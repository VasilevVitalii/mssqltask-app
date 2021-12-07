import { reactive } from "vue"
import { TDepotMssql } from "../../../src/depotMssql"
import { TDepotTask } from "../../../src/depotTask"
import { send } from "@/transport/rest"
import { stateToken } from "./token"

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

export const stateEdit = reactive({
    tryLoaded: false,
    loading: false,
    load: async function () {
        if (this.loading) return
        this.loading = true
        send(
            {
                kind: "edit-load",
                token: stateToken.token
            },
            result => {
                console.log(result)
                this.loading = false
                this.tryLoaded = true
            }
        )
    },
    mssqls: [] as TMssql[],
    tasks: [] as TTask[]
})
