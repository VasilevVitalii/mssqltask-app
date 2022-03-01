import * as vv from 'vv-common'
import { env } from './../app'
import { TServerEvent } from 'vv-httpgate'
import { TPost, TPostSigninRealtime, TPostTasksRealtime, TReply } from './onPost'
import { TTaskState } from 'mssqltask'
import { TMssqlTask, TStory } from '../mssqltask'

export type TESRequestTask = {
    key: string,
    title: string,
    state: "idle" | "work" | "stop",
    stories: TStory[]
}

export type TESRequest =
    {kind: 'signin-realtime', session: string} |
    {kind: 'tasks', tasks: TESRequestTask[]} |
    {kind: 'task', task: TESRequestTask} |
    {kind: 'task-remove', key: string}

type TSession = {
    event: TServerEvent
    key: string,
    callbackTaskChange: (task: TMssqlTask, state: TTaskState) => void
}

const sessions = [] as TSession[]

export function Handler(event: TServerEvent) {
    const session: TSession = {
        event: event,
        key: `${vv.dateFormat(new Date(), '126')}#${vv.guid()}`,
        callbackTaskChange: undefined
    }
    env.logger.debugExt('api', `prepare ServerEvent, session key ${session.key}`)
    session.event.onClose(() => {
        if (session.callbackTaskChange) {
            const fnd = env.callbackTaskChange.findIndex(f => f === session.callbackTaskChange)
            if (fnd >= 0) env.callbackTaskChange.splice(fnd, 1)
        }
        session.event = undefined
        const fnd = sessions.findIndex(f => f === session)
        if (fnd >= 0) {
            sessions.splice(fnd, 1)
        }
        env.logger.debugExt('api', `close ServerEvent, session key ${session.key}, sessions ${sessions.filter(f => f.event).length}`)
    })

    reply(session.event, {kind: 'signin-realtime', session: session.key}, () => {
        sessions.push(session)
    })
}

export function OnSigninRealtime(requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) {
    const rd = requestData as TPostSigninRealtime
    if (env.options.manage.passwordRealtime !== rd.password) {
        callback(403, 'incorrect password')
        return
    }
    start(rd.session, callback)
}

export function OnTasksRealtime(requestData: TPost, callback: (statusCode: number, message: TReply | string) => void) {
    const rd = requestData as TPostTasksRealtime
    start(rd.session, callback)
}

function start(sessionKey: string, callback: (statusCode: number, message: TReply | string) => void) {
    const session = sessions.find(f => f.key === sessionKey)
    if (!session) {
        callback(400, `unknown session key`)
        return
    }
    if (!session.event) {
        callback(500, `session closed`)
        return
    }
    env.logger.debugExt('api', `open ServerEvent, session key ${session.key}, sessions ${sessions.filter(f => f.event).length}`)
    reply(session.event, {
        kind: 'tasks',
        tasks: env.mssqltask.list.map(m => { return {
            key: m.source.task.key,
            title: m.source.task.title,
            state: m.state,
            stories: m.stories
        } } )
    }, () => {
        if (session.callbackTaskChange) {
            return
        }
        session.callbackTaskChange = (task: TMssqlTask, state: TTaskState) => {
            if (state && state.kind === 'finish') {
                reply(session.event, {
                    kind: 'task-remove',
                    key: task.source.task.key
                }, () => {})
            } else {
                reply(session.event, {
                    kind: 'task',
                    task: {
                        key: task.source.task.key,
                        title: task.source.task.title,
                        state: task.state,
                        stories: task.stories
                    }
                }, () => {})
            }
        }
        env.callbackTaskChange.push(session.callbackTaskChange)
    })
}

function reply(event: TServerEvent, request: TESRequest, callback: () => void) {
    if (!event) {
        callback()
        return
    }
    event.reply(JSON.stringify(request), (error, isOpened) => {
        if (error || !isOpened) {
            setTimeout(() => reply(event, request, callback), 2000)
        } else {
            callback()
        }
    })
}