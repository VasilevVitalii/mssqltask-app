import { createApp } from "vue"
import App from "@/App.vue"
import { router } from "@/core/router"
import { Quasar, Notify, Dialog } from "quasar"
import quasarUserOptions from "@/quasar-user-options"

createApp(App).use(Quasar, { plugins: { Notify, Dialog } }, quasarUserOptions).use(router).mount("#app")
