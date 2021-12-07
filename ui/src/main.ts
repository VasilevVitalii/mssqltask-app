import { createApp } from "vue"
import App from "./App.vue"
import { router } from "./transport/router"
import { Quasar, Notify } from "quasar"
import quasarUserOptions from "./quasar-user-options"

createApp(App).use(Quasar, { plugins: { Notify } }, quasarUserOptions).use(router).mount("#app")
