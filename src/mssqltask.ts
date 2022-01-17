import * as vv from 'vv-common'
import { env } from './app'
import * as mssqltask from 'mssqltask'
import { TDepotTask } from './depotTask'
import { TDepotMssql } from './depotMssql'

const SUCCESS_STORY_LENGTH = 10

export type TMssqlTask = {
    mssqltask: mssqltask.IApp,
    source: {task: TDepotTask, mssqls: TDepotMssql[]},
    usedWorkers: number,
    state: ('idle' | 'work' | 'stop'),
    needRemove: boolean,
    shift: {task: TDepotTask, mssqls: TDepotMssql[]},
    sucessStory: ('full' | 'part' | 'none')[]
}

export function Go() {
    env.mssqltask.timerRefresh = setTimeout(function tick() {
        for (let i = env.mssqltask.list.length - 1; i >= 0; i--) {
            if (!env.mssqltask.list[i].needRemove) continue
            env.mssqltask.list.splice(i, 1)
        }
        if (!env.mssqltask.needUpdate) {
            env.mssqltask.timerRefresh = setTimeout(tick, 1000)
            return
        }
        env.mssqltask.needUpdate = false

        const list = env.depot.task.list.filter(f => !env.depot.task.badList.some(ff => vv.equal(ff, f.key))).map(m => { return {
            task: m,
            mssqls: serverList(m, env.depot.mssql.list.filter(f => !env.depot.mssql.badList.some(ff => vv.equal(ff, f.instance))))
        }})
        for (let i = list.length - 1; i >= 0; i--) {
            const item = list[i]
            let needIgnore = false
            if (item.mssqls.length <= 0) {
                needIgnore = true
                env.logger.errorExt('task', `ignore "${item.task.key}", because it has an empty server list`)
            }
            if (needIgnore) {
                list.splice(i, 1)
            }
        }

        env.mssqltask.list.filter(f => !list.some(ff => vv.equal(ff.task.path, f.source.task.path) && vv.equal(ff.task.file, f.source.task.file))).forEach(item => {
            item.mssqltask.finish()
        })
        list.forEach(item => {
            const fnd = env.mssqltask.list.find(f => vv.equal(f.source.task.path, item.task.path) && vv.equal(f.source.task.file, item.task.file))
            if (fnd) {
                const itemJson = JSON.stringify(item)
                if (itemJson !== JSON.stringify(fnd.source)) {
                    const submsg = fnd.source.task.key === item.task.key ? `"${fnd.source.task.key}"` : `"${fnd.source.task.key}" -> "${item.task.key}"`
                    env.logger.debugExt('task', `shift ${submsg}`)
                    fnd.shift = JSON.parse(itemJson)
                    fnd.mssqltask.finish()
                }
            } else {
                addAndStart(item)
            }
        })

        env.mssqltask.timerRefresh = setTimeout(tick, 1000)
    }, 1000)
}

function serverList(task: TDepotTask, mssqls: TDepotMssql[] ): TDepotMssql[] {
    const res = [] as TDepotMssql[]
    task.mssqls.tags.forEach(tag => {
        mssqls.filter(f => f.tags.some(ff => vv.equal(ff, tag))).forEach(mssql => {
            if (res.some(f => vv.equal(f.instance, mssql.instance))) return
            res.push(mssql)
        })
    })
    task.mssqls.instances.forEach(instance => {
        const mssql = mssqls.find(f => vv.equal(f.instance, instance))
        if (!mssql || res.some(f => vv.equal(f.instance, mssql.instance))) return
        res.push(mssql)
    })

    return res
}

function createCore(depot: {task: TDepotTask, mssqls: TDepotMssql[]}) : mssqltask.IApp {
    const res = mssqltask.Create({
        key: depot.task.key,
        metronom: depot.task.metronom,
        queries: depot.task.queries,
        servers: depot.mssqls,
        processResult: {
            pathSaveTickets: env.options.task.path,
            pathSaveRows: depot.task.allowRows === true ? env.options.task.path : undefined,
            pathSaveMessages: depot.task.allowMessages === true ? env.options.task.path : undefined,
        }
    })
    res.maxWorkersSet(env.options.task.maxThreads)
    res.onError(error => {
        env.logger.errorExt('MSSQLTASK core', error)
    })
    return res
}

function addAndStart(depot: {task: TDepotTask, mssqls: TDepotMssql[]}) {
    const item: TMssqlTask = {
        mssqltask: createCore(depot),
        source: JSON.parse(JSON.stringify(depot)),
        usedWorkers: 0,
        shift: undefined,
        state: 'idle',
        needRemove: false,
        sucessStory: []
    }
    env.mssqltask.list.push(item)

    item.mssqltask.onChanged(state => {
        if (state.kind === 'start') {
            item.state = 'work'
            item.usedWorkers = state.usedWorkers
            env.logger.traceExt('task', `process "${item.source.task.key}"`)
            setMaxWorkers()
        } else if (state.kind === 'stop') {
            item.state = 'idle'
            item.usedWorkers = 0
            env.logger.traceExt('task', `idle "${item.source.task.key}"`)
            setMaxWorkers()
            const countOk = state.ticket.servers.filter(f => !f.execError).length
            const countBad = state.ticket.servers.filter(f => f.execError).length
            item.sucessStory.unshift(countBad === 0 ? 'full' : countOk === 0 ? 'none' : 'part')
            if (item.sucessStory.length > SUCCESS_STORY_LENGTH) item.sucessStory.splice(SUCCESS_STORY_LENGTH, 1)
        } else if (state.kind === 'finish') {
            env.logger.debugExt('task', `finish "${item.source.task.key}"`)
            item.needRemove = true
            if (item.shift) {
                addAndStart(item.shift)
            }
        }
    })

    env.logger.debugExt('task', `run "${item.source.task.key}"`)
    item.mssqltask.start()
}

function setMaxWorkers() {
    let usedWorkers = 0
    env.mssqltask.list.filter(f => f.state === 'work').forEach(item => {
        usedWorkers = usedWorkers + item.usedWorkers
    })
    let freeWorkers = env.options.task.maxThreads - usedWorkers
    if (freeWorkers < 3) freeWorkers = 3
    env.mssqltask.list.filter(f => f.state === 'idle').forEach(item => {
        item.mssqltask.maxWorkersSet(freeWorkers)
    })
}