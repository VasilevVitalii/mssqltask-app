import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"
import { reactive } from "vue"

import Welcome from "../views/Welcome.vue"
import Signin from "../views/Signin.vue"
import Console from "../views/Console.vue"
import PageNotFound from "../views/PageNotFound.vue"

export type TUrl = "welcome" | "signin" | "console" | "404"
export type TConsole = "dashboard" | "history" | "edit"

export type TRoute = {
    url: TUrl
    path: string
    component: any
}

const namedRoutes: TRoute[] = [
    { url: "welcome", path: "/welcome", component: Welcome },
    { url: "signin", path: "/signin", component: Signin },
    { url: "console", path: "/console", component: Console },
    { url: "404", path: "/404", component: PageNotFound }
]

export const console = reactive({ value: "dashboard" as TConsole })

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
        next({ path: namedRoutes.find(f => f.url === "welcome")?.path || "/welcome" })
        return
    }
    const r = namedRoutes.find(f => f.path === to.path)
    if (!r) {
        next({ path: namedRoutes.find(f => f.url === "404")?.path || "/welcome" })
        return
    }

    next()
})

export function goto(to: TUrl | TConsole) {
    let needPath = ""
    if (to === "welcome") {
        needPath = namedRoutes.find(f => f.url === "welcome")?.path || ""
    } else if (to === "signin") {
        needPath = namedRoutes.find(f => f.url === "signin")?.path || ""
    } else if (to === "console" || to === "dashboard" || to === "history" || to === "edit") {
        needPath = namedRoutes.find(f => f.url === "console")?.path || ""
        if (to !== "console") {
            console.value = to
        }
    }
    if (needPath !== "" && router.currentRoute.value.path !== needPath) {
        router.push({ path: needPath })
    }
}

export default router

//https://class-component.vuejs.org/guide/class-component.html#data

// <script lang="ts">
// import { Options, Vue } from "vue-class-component"
// // import HelloWorld from "@/components/HelloWorld.vue" // @ is an alias to /src

// // @Options({
// //     components: {
// //         HelloWorld
// //     }
// // })
// export default class Home extends Vue {}

// </script>
