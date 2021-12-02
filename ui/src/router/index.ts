import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"
import { reactive } from "vue"

import Welcome from "../views/Welcome.vue"
import Signin from "../views/Signin.vue"
import Workflow from "../views/Workflow.vue"
import PageNotFound from "../views/PageNotFound.vue"

export type TUrl = "u-welcome" | "u-signin" | "u-workflow" | "u-404"
export type TWorkflow = "w-dashboard" | "w-history" | "w-edit"

export type TRoute = {
    url: TUrl
    path: string
    component: any
}

const namedRoutes: TRoute[] = [
    { url: "u-welcome", path: "/welcome", component: Welcome },
    { url: "u-signin", path: "/signin", component: Signin },
    { url: "u-workflow", path: "/workflow", component: Workflow },
    { url: "u-404", path: "/404", component: PageNotFound }
]

export const workflow = reactive({ value: "dashboard" as TWorkflow })

const routes: RouteRecordRaw[] = namedRoutes.map(m => {
    return {
        path: m.path,
        component: m.component
    }
})

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    if (to.path === "/") {
        next({ path: namedRoutes.find(f => f.url === "u-welcome")?.path || "/welcome" })
        return
    }
    const r = namedRoutes.find(f => f.path === to.path)
    if (!r) {
        next({ path: namedRoutes.find(f => f.url === "u-404")?.path || "/welcome" })
        return
    }

    next()
})

export function goto(to: TUrl | TWorkflow) {
    let needPath = ""
    if (to === "u-welcome") {
        needPath = namedRoutes.find(f => f.url === "u-welcome")?.path || ""
    } else if (to === "u-signin") {
        needPath = namedRoutes.find(f => f.url === "u-signin")?.path || ""
    } else if (to === "u-workflow" || to === "w-dashboard" || to === "w-history" || to === "w-edit") {
        needPath = namedRoutes.find(f => f.url === "u-workflow")?.path || ""
        if (to !== "u-workflow") {
            workflow.value = to
        }
    }
    if (needPath !== "" && router.currentRoute.value.path !== needPath) {
        router.push({ path: needPath })
    }
}

export default router
