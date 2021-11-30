import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"

import PageNotFound from "../views/PageNotFound.vue"
import Home from "../views/Home.vue"
import Signin from "../views/Signin.vue"
import History from "../views/History.vue"
import Edit from "../views/Edit.vue"
import Dashboard from "../views/Dashboard.vue"

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "Home",
        component: Home
    },
    {
        path: "/signin",
        name: "Signin",
        component: Signin
    },
    {
        path: "/history",
        name: "History",
        component: History
    },
    {
        path: "/edit",
        name: "Edit",
        component: Edit
    },
    {
        path: "/dashboard",
        name: "Dashboard",
        component: Dashboard
    },
    {
        path: "/:pathMatch(.*)*",
        name: "PageNotFound",
        component: PageNotFound
    }
    // {
    //     path: "/about",
    //     name: "About",../views/PageNotFound.vue
    //     // route level code-splitting
    //     // this generates a separate chunk (about.[hash].js) for this route
    //     // which is lazy-loaded when the route is visited.
    //     component: () => import(/* webpackChunkName: "about" */ "../views/404.vue")
    // }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

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
