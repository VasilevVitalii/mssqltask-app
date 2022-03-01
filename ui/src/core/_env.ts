import { notify as dialogNotify, promt as dialogPromt, question as dialogQuestion} from './dialog'
import { goto as routerGoto } from './router'
import * as vv from "vv-common"
import { Create as CreateTimer } from "vv-timer"
import api from './api'

export { api, dialogNotify, dialogPromt, dialogQuestion, routerGoto }

export function showDate(d: Date): string {
    return vv.dateFormat(d, "yyyy-mm-dd")
}

export function showDateTime(d: Date): string {
    return vv.dateFormat(d, "yyyy.mm.dd hh:mi:ss.msec")
}

export function showMsec(msec: number): string {
    if (!msec || msec <= 0) {
        return ''
    }
    const parts = vv.dateParts(msec)

    if (parts.day > 0) {
        if (parts.minute > 30) parts.hour++
        return `${parts.day.toString().padStart(2, "0")} day ${parts.hour.toString().padStart(2, "0")} hour`
    }
    if (parts.hour > 0) {
        if (parts.second > 30) parts.minute++
        return `${parts.hour.toString().padStart(2, "0")} hour ${parts.minute.toString().padStart(2, "0")} min`
    }
    if (parts.minute > 5) {
        if (parts.second > 30) parts.minute++
        return `${parts.minute.toString().padStart(2, "0")} min`
    }
    if (parts.minute > 0) {
        if (parts.millisecond > 500) parts.second++
        return `${parts.minute.toString().padStart(2, "0")} min ${parts.second.toString().padStart(2, "0")} sec`
    }
    if (parts.second > 5) {
        if (parts.millisecond > 500) parts.second++
        return `${parts.second.toString().padStart(2, "0")} sec`
    }
    if (parts.second > 0) {
        return `${parts.second.toString().padStart(2, "0")} sec ${parts.millisecond.toString().padStart(2, "0")} msec`
    }

    return `${parts.millisecond.toString().padStart(3, "0")} msec`
}

export function showMsecAgo(msec: number | undefined): string {
    if (!msec || msec <= 0) {
        return ''
    }
    const parts = vv.dateParts(msec)

    if (parts.day > 0) {
        if (parts.minute > 30) parts.hour++
        return `${parts.day} day ${parts.hour.toString().padStart(2, "0")} hour ago`
    }
    if (parts.hour > 0) {
        if (parts.second > 30) parts.minute++
        return `${parts.hour} hour ${parts.minute.toString().padStart(2, "0")} min ago`
    }
    if (parts.minute > 5) {
        if (parts.second > 30) parts.minute++
        return `${parts.minute} min ago`
    }
    if (parts.minute > 0) {
        if (parts.millisecond > 500) parts.second++
        return `${parts.minute} min ${parts.second.toString().padStart(2, "0")} sec ago`
    }
    if (parts.second > 3) {
        if (parts.millisecond > 500) parts.second++
        return `${parts.second} sec ago`
    }

    return `just now`
}

export function showFileSize(sizeBytes: number): string {
    //less than 100b
    if (sizeBytes < 100) {
        return `${sizeBytes}b`
    }
    //less than 100kb
    if (sizeBytes < 1000 * 100) {
        return `${(sizeBytes / 1000).toFixed(1)}kb`
    }
    //less than 100mb
    if (sizeBytes < 1000 * 1000 * 100) {
        return `${(sizeBytes / (1000 * 1000)).toFixed(1)}mb`
    }
    //less than 100gb
    if (sizeBytes < 1000 * 1000 * 1000 * 100) {
        return `${(sizeBytes / (1000 * 1000 * 1000)).toFixed(1)}gb`
    }
    return `${(sizeBytes / (1000 * 1000 * 1000 * 1000)).toFixed(1)}tb`
}

export const timers = {
    sec1: CreateTimer(1000)
}