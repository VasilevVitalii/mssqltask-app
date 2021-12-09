type TKind = "info" | "warn" | "error"
type TText = string | Error | (string | Error)[]
type TNotifyQuasar = { type: string; message: string; timeout: number }

let callbackOnNotify: (notify: TNotifyQuasar) => void

export function notify(kind: TKind, text: TText) {
    if (!callbackOnNotify) return
    callbackOnNotify({
        type: kind === "error" ? "negative" : kind === "warn" ? "warning" : "positive",
        // eslint-disable-next-line prettier/prettier
        message: typeof text === "string" ? text : Array.isArray(text) ? text.map(item => { return typeof item === "string" ? item : item.message }).join("") : text.message,
        timeout: kind === "error" ? 5000 : kind === "warn" ? 3000 : 2000
    })
}

export function onNotify(callback: (notify: TNotifyQuasar) => void) {
    callbackOnNotify = callback
}
