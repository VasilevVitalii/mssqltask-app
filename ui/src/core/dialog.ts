type TKind = "info" | "warn" | "error"
type TText = string | Error | (string | Error)[]
type TNotifyQuasar = { type: string; message: string; timeout: number }
import { resolve } from "path/posix"
import { Dialog } from "quasar"

let callbackOnNotify: (notify: TNotifyQuasar) => void

export function notify(kind: TKind, text: TText) {
    if (!callbackOnNotify) return
    callbackOnNotify({
        type: kind === "error" ? "negative" : kind === "warn" ? "warning" : "positive",
        // eslint-disable-next-line prettier/prettier
        message: typeof text === "string" ? text : Array.isArray(text) ? text.map(item => { return typeof item === "string" ? item : item.message }).join("") : text.message,
        timeout: kind === "error" ? 8000 : kind === "warn" ? 5000 : 3000
    })
}

export async function promt(kind: "text" | "number" | "textarea", title: string, message: string, defaultValue: string): Promise<string | undefined> {
    const res = new Promise(resolve => {
        Dialog.create({
            title: title,
            message: message,
            cancel: true,
            persistent: true,
            prompt: {
                model: defaultValue,
                type: kind
            }
        })
            .onOk(data => {
                resolve(data)
            })
            .onCancel(() => {
                resolve(undefined)
            })
            .onDismiss(() => {
                resolve(undefined)
            })
    })
    let result = "" as string
    await res.then(data => {
        result = data as string
    })
    return result
}

export function onNotify(callback: (notify: TNotifyQuasar) => void) {
    callbackOnNotify = callback
}
