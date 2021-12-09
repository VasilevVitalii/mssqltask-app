import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"
import { reactive } from "vue"

import Welcome from "@/views/Welcome.vue"
import Signin from "@/views/Signin.vue"
import Workflow from "@/views/Workflow.vue"
import PageNotFound from "@/views/PageNotFound.vue"

export type TUrl = "u-welcome" | "u-signin" | "u-workflow" | "u-pagenotfound"
export type TWorkflow = "w-dashboard" | "w-history" | "w-edit"
export type TRoute = {
    url: TUrl
    path: string
    component: any
}
export type TNavigator = { route: TRoute; workflows: TWorkflow[] }

const navigatorWelcome: TNavigator = { route: { url: "u-welcome", path: "/welcome", component: Welcome }, workflows: [] }
const navigatorSignin: TNavigator = { route: { url: "u-signin", path: "/signin", component: Signin }, workflows: [] }
const navigatorPageNotFound: TNavigator = { route: { url: "u-pagenotfound", path: "/pagenotfound", component: PageNotFound }, workflows: [] }
const navigatorWorkflow: TNavigator = {
    route: { url: "u-workflow", path: "/workflow", component: Workflow },
    workflows: ["w-dashboard", "w-history", "w-edit"]
}
const navigators: TNavigator[] = [navigatorWelcome, navigatorSignin, navigatorPageNotFound, navigatorWorkflow]

const routes: RouteRecordRaw[] = navigators.map(m => {
    return {
        path: m.route.path,
        component: m.route.component
    }
})

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export const state = reactive({
    currentWorkflow: "w-dashboard" as TWorkflow
})

const callbacksOnGoto: ((from: TRoute | undefined, to: TRoute | undefined, workflow: TWorkflow) => void)[] = []

router.beforeEach((to, from, next) => {
    if (to.path === "/") {
        next({ path: navigatorWelcome.route.path })
        return
    }
    if (!navigators.some(f => f.route.path === to.path)) {
        next({ path: navigatorPageNotFound.route.path })
        return
    }
    next()
})

router.afterEach((to, from) => {
    if (callbacksOnGoto.length <= 0) return
    const fromN = navigators.find(f => f.route.path === from.path)
    const toN = navigators.find(f => f.route.path === to.path)
    callbacksOnGoto.forEach(f => {
        f(fromN?.route, toN?.route, state.currentWorkflow)
    })
})

export function goto(to: TUrl | TWorkflow) {
    let navigation = navigators.find(f => f.route.url === to)
    if (navigation) {
        router.push({ path: navigation.route.path })
        return
    }

    navigation = navigators.find(f => f.workflows.some(f => f === to))
    if (navigation) {
        state.currentWorkflow = to as TWorkflow
        router.push({ path: navigation.route.path })
        return
    }

    router.push({ path: navigatorPageNotFound.route.path })
}

export function onGoto(callback: (from: TRoute | undefined, to: TRoute | undefined, workflow: TWorkflow) => void) {
    callbacksOnGoto.push(callback)
}
