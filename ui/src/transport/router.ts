import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"
import { reactive } from "vue"

import Welcome from "../views/Welcome.vue"
import Signin from "../views/Signin.vue"
import Workflow from "../views/Workflow.vue"
import PageNotFound from "../views/PageNotFound.vue"
import { stateEdit } from "@/store/edit"

export type TUrl = "u-welcome" | "u-signin" | "u-workflow" | "u-pagenotfound"
export type TWorkflow = "w-dashboard" | "w-history" | "w-edit"
export type TRoute = {
    url: TUrl
    path: string
    component: any
}
export type TNavigation = { route: TRoute; workflows: TWorkflow[] }

const navigationWelcome: TNavigation = { route: { url: "u-welcome", path: "/welcome", component: Welcome }, workflows: [] }
const navigationSignin: TNavigation = { route: { url: "u-signin", path: "/signin", component: Signin }, workflows: [] }
const navigationPageNotFound: TNavigation = { route: { url: "u-pagenotfound", path: "/pagenotfound", component: PageNotFound }, workflows: [] }
const navigationWorkflow: TNavigation = {
    route: { url: "u-workflow", path: "/workflow", component: Workflow },
    workflows: ["w-dashboard", "w-history", "w-edit"]
}
const navigations: TNavigation[] = [navigationWelcome, navigationSignin, navigationPageNotFound, navigationWorkflow]

const routes: RouteRecordRaw[] = navigations.map(m => {
    return {
        path: m.route.path,
        component: m.route.component
    }
})

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    if (to.path === "/") {
        next({ path: navigationWelcome.route.path })
        return
    }
    if (!navigations.some(f => f.route.path === to.path)) {
        next({ path: navigationPageNotFound.route.path })
        return
    }
    next()
})

router.afterEach(to => {
    if (to.path === navigationWorkflow.route.path && stateRouter.currentWorkflow === "w-edit" && !stateEdit.tryLoaded) {
        stateEdit.load()
    }
})

export function routerGoto(to: TUrl | TWorkflow) {
    let navigation = navigations.find(f => f.route.url === to)
    if (navigation) {
        router.push({ path: navigation.route.path })
        return
    }

    navigation = navigations.find(f => f.workflows.some(f => f === to))
    if (navigation) {
        stateRouter.currentWorkflow = to as TWorkflow
        router.push({ path: navigation.route.path })
        return
    }

    router.push({ path: navigationPageNotFound.route.path })
}

export const stateRouter = reactive({
    currentWorkflow: "w-dashboard" as TWorkflow
})
