import { reactive } from "vue"
import { TDepotMssql } from "../../../src/depotMssql"
import { TDepotTask } from "../../../src/depotTask"

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

const state = reactive({
    mssqls: [] as TMssql[],
    tasks: [] as TTask[]
})

export default () => ({
    state
})
