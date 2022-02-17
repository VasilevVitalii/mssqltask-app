import { Dialog } from "quasar"

type TNotifyQuasar = { type: string; message: string; timeout: number }
let callbackOnNotify: (notify: TNotifyQuasar) => void
export function onNotify(callback: (notify: TNotifyQuasar) => void) {
    callbackOnNotify = callback
}

export function notify(kind: "info" | "warn" | "error", text: string | Error) {
    if (!callbackOnNotify) return
    callbackOnNotify({
        type: kind === "error" ? "negative" : kind === "warn" ? "warning" : "positive",
        message: typeof text === "string" ? text : text.message || 'Unknown error',
        timeout: kind === "error" ? 8000 : kind === "warn" ? 5000 : 3000
    })
}

export function promt(kind: "text" | "number" | "textarea" | "password", title: string, message: string, defaultValue: string, callback: (result: string) => void) {
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
    res.then(data => {
        callback(data as string)
    })
}

export function question(title: string, message: string, callback: (result: boolean) => void) {
    const res = new Promise(resolve => {
        Dialog.create({
            title: title,
            message: message,
            cancel: true,
            persistent: true,
        })
            .onOk(() => {
                resolve(true)
            })
            .onOk(() => {
                resolve(true)
            })
            .onCancel(() => {
                resolve(false)
            })
            .onDismiss(() => {
                resolve(false)
            })
    })
    res.then(data => {
        callback(data as boolean)
    })
}