import path from 'path'
import fs from 'fs'
import { Create as DepotCreate, IApp} from 'backdepot'
import { Create as LoggerManagerCreate, ILogger } from 'vv-logger'
import * as options from './options'
import * as storeMssql from './storeMssql'
import * as storeTask from './storeTask'
import { setTimeout } from 'timers'

const loggerManager = LoggerManagerCreate()
loggerManager.onError(error => {
    console.error(error)
})

const env = {
    logger: undefined as ILogger,
    options: undefined as options.TOptions,
    depot: {
        app: undefined as IApp,
        mssql: {
            list: [] as storeMssql.TMssql[],
            isInit: false,
            isChange: false
        },
        task : {
            list: [] as storeTask.TTask[],
            isInit: false,
            isChange: false
        },
    },
    job: {
        isInit: false,
        needUpdateByMssql: false,
        needUpdateByTask: false,
    }
    // isMssqlsInit: false,
    // isTasksInit: false,
    // isMssqlsChange: false,
    // isMssqlsChange: false,
}

export function Go(currentPath: string) {
    env.options = options.Read(path.join(currentPath, 'mssqltask-app.json'))
    env.logger = loggerManager.addLogger ({
        consoleLevel: env.options.log.allowTrace ? 'trace' : 'debug',
        transports: [
            {kind: 'file', dir: env.options.log.path, levels: ['error'], fileNamePrefix: 'error', fileLifeDay: env.options.log.lifeDays},
            {kind: 'file', dir: env.options.log.path, levels: ['debug', 'error'], fileNamePrefix: 'debug', fileLifeDay: env.options.log.lifeDays},
            {kind: 'file', dir: env.options.log.path, levels: ['trace', 'debug', 'error'], fileNamePrefix: 'trace', fileLifeDay: env.options.log.lifeDays},
        ]
    })
    depotGo()
    jobGo()
}

function depotGo() {
    env.depot.app = DepotCreate({
        pathMap: 'MEMORY',
        pathData: undefined,
        states: [
            {name: 'mssql', pathData: env.options.data.pathMssql},
            {name: 'task', pathData: env.options.data.pathTask},
        ]
    }, error => {
        if (error) {
            env.logger.error(`on init storage`, error)
        }
    })
    env.depot.app.callback.onError(error => {
        env.logger.error(`STORAGE`, error)
    })
    env.depot.app.callback.onDebug(debug => {
        env.logger.debug(`STORAGE - ${debug}`)
    })
    env.depot.app.callback.onTrace(trace => {
        env.logger.trace(`STORAGE - ${trace}`)
    })
    env.depot.app.callback.onStateComplete(() => {
        storeMssql.Load(env.depot.app, env.depot.mssql.list, env.options.data.pathMssql, (error) => {
            if (error) {
                env.logger.error('STORAGE', error)
            } else {
                env.depot.mssql.isInit = true
            }
        })
        storeTask.Load(env.depot.app, env.depot.task.list, env.options.data.pathTask, (error) => {
            if (error) {
                env.logger.error('STORAGE', error)
            } else {
                env.depot.task.isInit = true
            }
        })
    })
    env.depot.app.callback.onStateChange(states => {
        states.forEach(state => {
            if (state.state === 'mssql') {
                storeMssql.Upsert(state.rows, state.action, env.depot.mssql.list)
                env.depot.mssql.isChange = true
            } else if (state.state === 'task') {
                storeTask.Upsert(state.rows, state.action, env.depot.task.list)
                env.depot.task.isChange = true
            }
        })
    })

    env.depot.app.start()
}

function jobGo() {
    let timer = setTimeout(function tick() {
        if (!env.depot.mssql.isInit || !env.depot.task.isInit) {
            timer = setTimeout(tick, 1000)
            return
        }
        let allowThisTick = true
        if (env.job.isInit) {
            if (env.depot.mssql.isChange) {
                env.depot.mssql.isChange = false
                env.job.needUpdateByMssql = true
                allowThisTick = false
            }
            if (env.depot.task.isChange) {
                env.depot.task.isChange = false
                env.job.needUpdateByTask = true
                allowThisTick = false
            }
            if (!env.job.needUpdateByMssql && !env.job.needUpdateByTask) {
                allowThisTick = false
            }
        } else {
            env.job.isInit = true
        }

        if (!allowThisTick) {
            timer = setTimeout(tick, 1000)
            return
        }
        env.job.needUpdateByMssql = false
        env.job.needUpdateByTask = false

        console.log(env.depot.mssql.list)
        console.log(env.depot.task.list)

        timer = setTimeout(tick, 1000)
    }, 1000)
}