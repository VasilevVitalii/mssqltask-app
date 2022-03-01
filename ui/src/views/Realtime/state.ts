import { reactive } from "vue"
import * as vv from "vv-common"
import { TTimerHandler } from "vv-timer"
import * as env from "@/core/_env"
import { values } from '@/core/understudyValues'
import { TESRequest, TESRequestTask } from '../../../../src/api/onServerEvent'
import { sendDirectly } from "@/core/axios"
import { TStory } from "../../../../src/mssqltask"


export type TTask = TESRequestTask & {
    msecAgo: number | undefined,
    story: () => TStory | undefined
}

export const state = reactive({
    data: {
        es: undefined as EventSource | undefined,
        tasks: [] as TTask[],
        timer: undefined as TTimerHandler | undefined,
        showPasswordPromt: false,
        session: undefined as string | undefined,
        showDetailsByTaskKey: undefined as string | undefined,
    },
    func: {
        start: (callback?: () => void) => {
            console.log('START!')
            if (state.data.es) {
                if (callback) callback
                return
            }

            if (!state.data.timer) {
                const timer = env.timers.sec1.create()
                timer.onTick = () => {
                    msecAgo(state.data.tasks)
                    timer.nextTick()
                }
                state.data.timer = timer
            }

            state.data.es = new EventSource(values.backendUrl + '/realtimeEs' , { withCredentials: true } )
            state.data.es.onopen = (e) => {

            }
            state.data.es.onerror = (e) => {
                if (state.data.es?.readyState === EventSource.CONNECTING) {
                    sendDirectly({kind: 'tasks-realtime', session: state.data.session || ''}, (status, reply) => {
                        if (status !== 200) {
                            state.func.stop()
                            env.dialogNotify('error', 'error reconnect realtime')
                            return
                        } else {
                            console.log('reconnect EventSource')
                        }
                    })
                } else {
                    console.log('error EventSource', e)
                    state.func.stop()
                }
            }

            state.data.es.onmessage = function(e) {
                let data = undefined as unknown as TESRequest
                try {
                    data = JSON.parse(e.data)
                } catch (error) {
                    env.dialogNotify('error', 'error convert string from backend to object')
                }
                if (data.kind === 'signin-realtime') {
                    if (state.data.showPasswordPromt) return
                    state.data.showPasswordPromt = true
                    state.data.session = data.session

                    env.dialogPromt('password', 'REALTIME', 'enter password', '', password => {
                        state.data.showPasswordPromt = false
                        if (password === undefined) {
                            state.func.stop()
                            return
                        }
                        sendDirectly({kind: 'signin-realtime', password: password, session: state.data.session || ''}, (status, reply) => {
                            if (status !== 200) {
                                state.func.stop()
                                env.dialogNotify('error', 'error start realtime')
                                return
                            }
                        })
                    })
                } else if (data.kind === 'tasks') {
                    console.log('tasks')
                    state.data.tasks = data.tasks.map(m => {
                        return {
                            ...m,
                            msecAgo: undefined,
                            story: function (): TStory | undefined {
                                return this.stories.length > 0 ? this.stories[this.stories.length - 1] : undefined 
                            }
                        }
                    })
                    state.data.tasks.sort((a, b) => {
                        if (a.key > b.key) return 1
                        if (a.key < b.key) return -1
                        return 0
                    })
                } else if (data.kind === 'task') {
                    const task = data.task
                    console.log('task', task.key, task.state)
                    let fnd = state.data.tasks.findIndex(f => vv.equal(f.key, task.key))
                    if (fnd >= 0) {
                        state.data.tasks[fnd].state = task.state
                        state.data.tasks[fnd].stories = task.stories
                        state.data.tasks[fnd].title = task.title
                        state.data.tasks[fnd].msecAgo = undefined
                    } else {
                        state.data.tasks.push({
                            ...task,
                            msecAgo: undefined,
                            story: function (): TStory | undefined {
                                return this.stories.length > 0 ? this.stories[this.stories.length - 1] : undefined
                            }
                        })
                    }
                    state.data.tasks.sort((a, b) => {
                        if (a.key > b.key) return 1
                        if (a.key < b.key) return -1
                        return 0
                    })
                } else if (data.kind === 'task-remove') {
                    const key = data.key
                    console.log('del task', key)
                    let fnd = state.data.tasks.findIndex(f => vv.equal(f.key, key))
                    if (fnd >= 0) {
                        if (vv.equal(state.data.showDetailsByTaskKey, state.data.tasks[fnd].key)) {
                            state.data.showDetailsByTaskKey = undefined
                        }
                        state.data.tasks.splice(fnd, 1)
                    }
                }
            }
        },
        stop: () => {
            console.log('STOP')
            if (state.data.timer) {
                state.data.timer.finish()
                state.data.timer = undefined
            }
            state.data.showDetailsByTaskKey = undefined
            state.data.tasks = []
            if (state.data.es) {
                state.data.es.close()
                state.data.es = undefined
            }
            state.data.session = undefined
        },

        showDetailsByTask: () => {
            if (!state.data.showDetailsByTaskKey) return 0
            return state.data.tasks.find(f => vv.equal(f.key, state.data.showDetailsByTaskKey))
        }
    }
})

function msecAgo(tasks: TTask[]): void {
    const dn = new Date()
    tasks.forEach(item => {
        const dateStopString = item.story()?.dateStop
        if (!dateStopString) {
            item.msecAgo = undefined
            return
        }
        const dateStopDate = vv.toDate(dateStopString)
        if (!dateStopDate) {
            item.msecAgo = undefined
            return
        }
        item.msecAgo = dn.getTime() - dateStopDate.getTime()
    })
}