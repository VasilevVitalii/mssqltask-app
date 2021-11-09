import * as vv from 'vv-common'
import { env } from './app'
import * as mssqltask from 'mssqltask'
import { TDepotTask } from './depotTask'
import { TDepotMssql } from './depotMssql'

export type TMssqlTask = {
    mssqltask: mssqltask.IApp,
    key: string,
    state: ('worked' | 'stopped' | 'needremove'),
    shift: TMssqlTask,
    sucessStory: ('full' | 'part' | 'none')[]
}

export function Go() {
    env.mssqltask.timerRefresh = setTimeout(function tick() {
        if (!env.mssqltask.needUpdate) {
            env.mssqltask.timerRefresh = setTimeout(tick, 1000)
            return
        }
        env.mssqltask.needUpdate = false

        let list = env.depot.task.list.filter(f => !env.depot.task.badList.some(ff => vv.equal(ff, f.key))).map(m => { return {
            item: m,
            mssqls: serverList(m, env.depot.mssql.list.filter(f => !env.depot.mssql.badList.some(ff => vv.equal(ff, f.instance))))
        }})
        list.filter(f => f.mssqls.length <= 0).forEach(item => {
            env.logger.error(`MSSQLTASK - ignore "${item.item.key}", because it has an empty server list`)
        })
        list = list.filter(f => f.mssqls.length > 0)

        list.filter(f => !env.mssqltask.list.some(ff => vv.equal(ff.key, f.item.key))).forEach(item => {
            const t = {
                key: item.item.key,
                mssqltask: createItem(item),
                shift: undefined,
                state: 'worked',
                sucessStory: []
            } as TMssqlTask
            env.mssqltask.list.push(t)

            t.mssqltask.onChanged(state => {
                if (state.kind === 'stop') {
                    const countOk = state.ticket.servers.filter(f => !f.execError).length
                    const countBad = state.ticket.servers.filter(f => f.execError).length
                    t.sucessStory.unshift(countBad === 0 ? 'full' : countOk === 0 ? 'none' : 'part')
                    if (t.sucessStory.length > 10) { t.sucessStory.splice(10, 1) }
                    console.log(t.sucessStory)
                }
            })

            env.logger.debug(`MSSQLTASK - start "${item.item.key}"`)
            t.mssqltask.start()
        })

        // // 1. удаление которых нет
        // // 2. удаление, которые надо заменить + замена
        // // 3. добавление
        // env.depot.task.list.filter(f => !env.mssqltask.list.some(ff => vv.equal(ff.key, f.key))).forEach(task => {
        //     //const servers = serverList(task, env.depot.mssql.list.filter)
        //     // const item = mssqltask.Create({
        //     // })
        // })


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

function createItem(depot: {item: TDepotTask, mssqls: TDepotMssql[]}) : mssqltask.IApp {
    const res = mssqltask.Create({
        key: depot.item.key,
        metronom: depot.item.metronom,
        query: depot.item.query.join('\n'),
        servers: depot.mssqls,
        processResult: {
            allowCallbackRows: depot.item.allowRows,
            allowCallbackMessages: depot.item.allowMessages,
            pathSaveTickets: env.options.task.pathTickets,
            pathSaveRows: env.options.task.pathTickets,
            pathSaveMessages: env.options.task.pathTickets,
        }
    })
    res.maxWorkersSet(env.options.task.maxThreads)
    res.onError(error => {
        env.logger.error('MSSQLTASK', error)
    })

    return res
}