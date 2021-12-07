import { reactive } from "vue"

type TKind = "info" | "warn" | "error"

// export function showNotify(kind: TKind, text: string | Error | (string | Error)[]) {
//     const type = kind === "error" ? "negative" : kind === "warn" ? "warning" : "positive"
//     const timeout = kind === "error" ? 5000 : kind === "warn" ? 3000 : 2000
//     // eslint-disable-next-line prettier/prettier
//     const message = typeof text === "string" ? text : Array.isArray(text) ? text.map(m => { return typeof m === "string" ? m : m.message }).join("") : text.message
//     q.notify({
//         type: type,
//         message: message,
//         timeout: timeout
//     })
// }

export const stateNotife = reactive({
    list: [] as { kind: TKind; text: string | Error | (string | Error)[] }[]
})
