import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"
import { reactive } from "vue"

import Welcome from "../views/Welcome.vue"
import Signin from "../views/Signin.vue"
import Workflow from "../views/Workflow.vue"
import PageNotFound from "../views/PageNotFound.vue"
import { TPost } from "../../../src/console"
import { state as stateEdit } from "@/store/edit"

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

router.afterEach((to, from) => {
    if (to.path === namedRoutes.find(f => f.url === "u-workflow")?.path || ("" && workflow.value === "w-edit")) {
        if (!stateEdit.tryLoaded) {
            stateEdit.load()
        }
    }
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

export async function post(data: TPost): Promise<{ errorText: string | undefined; response: any | undefined }> {
    const request = {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify(data)
    }
    return await fetch("http://localhost:3000", request)
        .then(async response => {
            const data = await response.json()
            console.log(data)
            return { errorText: undefined, response: data }
            if (!response.ok) {
                const error = (data && data.message) || response.status
                return Promise.reject(error)
            }
        })
        .catch(error => {
            return { errorText: (error as Error)?.message || "UNKNOWN MESSAGE", response: undefined }
            // console.error("There was an error!", error)
        })
}

export function tokenGet(): string {
    return (localStorage.getItem("token") as string) || ""
}

export function tokenClear() {
    localStorage.removeItem("token")
}

export function signIn(password: string) {
    console.log(password)
}

export default router
