import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"
import { reactive } from "vue"

import PageNotFound from "@/views/404.vue"
import Depot from "@/views/Depot/index.vue"
import HistoryService from "@/views/HistoryService/index.vue"
import HistoryTask from "@/views/HistoryTask/index.vue"
import Realtime from "@/views/Realtime.vue"
import Welcome from "@/views/Welcome.vue"

export type TPath = "/404" | "/depot" | "/historyservice" | "/historytask" | "/realtime" | "/"
export type TNavigator = { path: TPath; component: any }
const navigator: TNavigator[] = [
    {path: "/404", component: PageNotFound},
    {path: "/depot", component: Depot},
    {path: "/historyservice", component: HistoryService},
    {path: "/historytask", component: HistoryTask},
    {path: "/realtime", component: Realtime},
    {path: "/", component: Welcome}
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes: navigator
})

router.beforeEach((to, from, next) => {
    next()
})

router.afterEach((to, from) => {
})

export function goto(to: TPath) {
    router.push({ path: to })
}

// export function goto(to: TUrl | TWorkflow) {
//     let navigation = navigators.find(f => f.route.url === to)
//     if (navigation) {
//         router.push({ path: navigation.route.path })
//         return
//     }

//     navigation = navigators.find(f => f.workflows.some(f => f === to))
//     if (navigation) {
//         state.currentWorkflow = to as TWorkflow
//         router.push({ path: navigation.route.path })
//         return
//     }

//     router.push({ path: navigatorPageNotFound.route.path })
// }

// export function onGoto(callback: (from: TRoute | undefined, to: TRoute | undefined, workflow: TWorkflow) => void) {
//     callbacksOnGoto.push(callback)
// }
