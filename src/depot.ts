import * as vv from 'vv-common'
import { Create as DepotCreate} from 'backdepot'
import * as depotMssql from './depotMssql'
import * as depotTask from './depotTask'
import { env } from './app'

export type TUpsert = {
    delete: number,
    update: number,
    insert: number
}

export function Go() {
    env.depot.app = DepotCreate({
        pathMap: 'MEMORY',
        pathData: '',
        states: [
            {name: 'mssql', pathData: env.options.data.pathMssql},
            {name: 'task', pathData: env.options.data.pathTask},
        ]
    }, error => {
        if (error) {
            env.logger.errorExt(`on init DEPOT`, error)
        }
    })
    env.depot.app.callback.onError(error => {
        env.logger.errorExt(`DEPOT`, error)
    })
    if (env.options.log.allowTrace) {
        env.depot.app.callback.onDebug(debug => {
            env.logger.traceExt('depot', debug)
        })
        env.depot.app.callback.onTrace(trace => {
            env.logger.traceExt('depot', trace)
        })
    }
    env.depot.app.callback.onStateComplete(() => {
        depotMssql.Load(env.depot.app, env.depot.mssql.list, env.options.data.pathMssql, (error, isCreateExample, countLoaded) => {
            if (error) {
                env.logger.errorExt('DEPOT', error)
            } else {
                env.depot.mssql.isInit = true
                env.depot.mssql.isChange = true
                env.logger.debugExt('depot', `mssql - load ${countLoaded} item(s)${isCreateExample ? ', create example file(s)' : ''}`)
            }
        })
        depotTask.Load(env.depot.app, env.depot.task.list, env.options.data.pathTask, (error, isCreateExample, countLoaded) => {
            if (error) {
                env.logger.errorExt('DEPOT', error)
            } else {
                env.depot.task.isInit = true
                env.depot.task.isChange = true
                env.logger.debugExt('depot', `task - load ${countLoaded} item(s)${isCreateExample ? ', create example file(s)' : ''}`)
            }
        })
    })
    env.depot.app.callback.onStateChange(states => {
        states.forEach(state => {
            if (state.state === 'mssql') {
                const stat = depotMssql.Upsert(state.rows, state.action, env.depot.mssql.list)
                env.logger.debugExt('depot', `mssql - delete ${stat.delete} item(s), update ${stat.update} item(s), insert ${stat.insert} item(s)`)
                env.depot.mssql.isChange = true
            } else if (state.state === 'task') {
                const stat = depotTask.Upsert(state.rows, state.action, env.depot.task.list)
                env.logger.debugExt('depot', `task - delete ${stat.delete} item(s), update ${stat.update} item(s), insert ${stat.insert} item(s)`)
                env.depot.task.isChange = true
            }
        })
    })

    env.depot.app.start()
    refresh()
}

function refresh() {
    env.depot.timerRefresh = setTimeout(function tick() {
        if (!env.depot.mssql.isInit || !env.depot.task.isInit) {
            env.depot.timerRefresh = setTimeout(tick, 1000)
            return
        }
        if (env.depot.mssql.isChange) {
            env.depot.mssql.isChange = false
            env.depot.mssql.isChangePrev  = true
            env.depot.timerRefresh = setTimeout(tick, 1000)
            return
        }
        if (env.depot.task.isChange) {
            env.depot.task.isChange = false
            env.depot.task.isChangePrev = true
            env.depot.timerRefresh = setTimeout(tick, 1000)
            return
        }

        if (env.depot.mssql.isChangePrev) {
            env.mssqltask.needUpdate = true
            env.depot.mssql.isChangePrev = false
            env.depot.mssql.badList.splice(0, env.depot.mssql.badList.length)
            for (let i = 0; i < env.depot.mssql.list.length; i++) {
                for (let j = i + 1; j < env.depot.mssql.list.length; j++) {
                    const itemA = env.depot.mssql.list[i]
                    const itemB = env.depot.mssql.list[j]
                    if (!vv.equal(itemA.instance, itemB.instance)) continue
                    if (env.depot.mssql.badList.some(f => vv.equal(f, itemA.instance))) continue
                    env.depot.mssql.badList.push(itemA.instance)
                    env.logger.errorExt('depot', `mssql - ignore "${itemA.instance}", because it occurs more than once`)
                }
            }
        }

        if (env.depot.task.isChangePrev) {
            env.mssqltask.needUpdate = true
            env.depot.task.isChangePrev = false
            env.depot.task.badList.splice(0, env.depot.task.badList.length)
            for (let i = 0; i < env.depot.task.list.length; i++) {
                const itemA = env.depot.task.list[i]

                let needCheckDoubles = true

                if (vv.isEmpty(itemA.key) && !env.depot.task.badList.some(f => vv.equal(f, itemA.key))) {
                    env.depot.task.badList.push(itemA.key)
                    env.logger.errorExt('depot', `task - ignore "${itemA.key}", because it has an empty key`)
                    needCheckDoubles = false
                }

                if (itemA.key.length > 50 && !env.depot.task.badList.some(f => vv.equal(f, itemA.key))) {
                    env.depot.task.badList.push(itemA.key)
                    env.logger.errorExt('depot', `task - ignore "${itemA.key}", because it has a key with length more 50 chars`)
                    needCheckDoubles = false
                }

                if (!(new RegExp(/^[a-zA-Z0-9-_]+$/g)).test(itemA.key) && !env.depot.task.badList.some(f => vv.equal(f, itemA.key))) {
                    env.depot.task.badList.push(itemA.key)
                    env.logger.errorExt('depot', `task - ignore "${itemA.key}", because it has a key with illegal chars, legal chars - "a-z", "A-Z", "0-9", "_", "-"`)
                    needCheckDoubles = false
                }

                if (vv.isEmpty(itemA.queries.join('')) && !env.depot.task.badList.some(f => vv.equal(f, itemA.key))) {
                    env.depot.task.badList.push(itemA.key)
                    env.logger.errorExt('depot', `task - ignore "${itemA.key}", because it has an empty query list`)
                    needCheckDoubles = false
                }

                if (needCheckDoubles) {
                    for (let j = i + 1; j < env.depot.task.list.length; j++) {
                        const itemB = env.depot.task.list[j]
                        if (!vv.equal(itemA.key, itemB.key)) continue
                        if (env.depot.task.badList.some(f => vv.equal(f, itemA.key))) continue
                        env.depot.task.badList.push(itemA.key)
                        env.logger.errorExt('depot', `task - ignore "${itemA.key}", because it occurs more than once`)
                    }
                }

            }
        }

        env.depot.timerRefresh = setTimeout(tick, 1000)
    }, 1000)
}