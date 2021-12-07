import { reactive } from "vue"
import { send } from "@/transport/rest"
import { stateNotife } from "@/store/notify"

export const stateToken = reactive({
    token: "" as string,
    loading: false
})

export function clearToken() {
    localStorage.removeItem("token")
    stateToken.token = ""
}

export async function signin(password: string) {
    stateToken.loading = true
    send({ kind: "signin", data: { password: password } }, result => {
        console.log(result)
        stateToken.loading = false
    })
    // const result = await post({ kind: "signin", data: { password: password } })
    // if (result.errorText) {
    //     stateNotife.list.push({ kind: "error", text: ["Error signin", result.errorText] })
    // } else {
    //     console.log(result)
    // }
    // stateToken.loading = false
}

export function getToken(): string {
    return (localStorage.getItem("token") as string) || ""
}

export function signIn(password: string) {
    console.log(password)
}
