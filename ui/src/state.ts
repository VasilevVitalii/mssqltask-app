import { reactive } from "vue"

export const callbacksFullScreen = [] as (() => void)[]

export const state = reactive({
    data: {
        showMainMenu: true,
        fullscreen: false,
    },
    func: {
        onFullScreen(callback: (() => void)) {
            callbacksFullScreen.push(callback)
        }
    }
})