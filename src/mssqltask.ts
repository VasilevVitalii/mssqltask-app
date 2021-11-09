import * as vv from 'vv-common'
import { env } from './app'
import * as mssqltask from 'mssqltask'

export type TMssqlTask = {
    mssqltask: mssqltask.IApp,
    state: ('worked' | 'stopped' | 'needremove'),
    shift: TMssqlTask,
}

export function Go() {
    env.mssqltask.timerRefresh = setTimeout(function tick() {
        if (!env.mssqltask.needUpdate) {
            env.mssqltask.timerRefresh = setTimeout(tick, 1000)
            return
        }



        env.mssqltask.timerRefresh = setTimeout(tick, 1000)
    }, 1000)
}