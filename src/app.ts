import path from 'path'
import fs from 'fs'
import { Create as DepotCreate} from 'backdepot'
import { Create as LoggerManagerCreate } from 'vv-logger'
import * as options from './options'
import * as storeMssql from './storeMssql'
import * as storeTask from './storeTask'

const loggerManager = LoggerManagerCreate()
loggerManager.onError(error => {
    console.error(error)
})

const mssqls = [] as storeMssql.TMssql[]
const tasks = [] as storeTask.TTask[]

export function Go(currentPath: string) {
    const opt = options.Read(path.join(currentPath, 'mssqltask-app.json'))
    const logger = loggerManager.addLogger ({
        consoleLevel: opt.log.allowTrace ? 'trace' : 'debug',
        transports: [
            {kind: 'file', dir: opt.log.path, levels: ['error'], fileNamePrefix: 'error', fileLifeDay: opt.log.lifeDays},
            {kind: 'file', dir: opt.log.path, levels: ['debug', 'error'], fileNamePrefix: 'debug', fileLifeDay: opt.log.lifeDays},
            {kind: 'file', dir: opt.log.path, levels: ['trace', 'debug', 'error'], fileNamePrefix: 'trace', fileLifeDay: opt.log.lifeDays},
        ]
    })
    const depot = DepotCreate({
        pathMap: 'MEMORY',
        pathData: path.join(currentPath, 'data'),
        states: [
            {name: 'mssql', pathData: opt.data.pathMssql},
            {name: 'task', pathData: opt.data.pathTask},
        ]
    }, error => {
        if (error) {
            logger.error(`on init storage`, error)
        }
    })
    depot.callback.onError(error => {
        logger.error(`STORAGE`, error)
    })
    depot.callback.onDebug(debug => {
        logger.debug(`STORAGE - ${debug}`)
    })
    depot.callback.onTrace(trace => {
        logger.trace(`STORAGE - ${trace}`)
    })
    depot.callback.onStateComplete(() => {
        depot.get.obtain([{state: 'mssql'}, {state: 'task'}], (error, states) => {
            if (error) {
                logger.error('STORAGE', error)
            }
            if (!states) return
            states.forEach(state => {
                if (state.state === 'mssql') {
                    state.rows.forEach(row => {
                        mssqls.push(storeMssql.GetFromStorage(row))
                    })
                    if (mssqls.length <= 0) {
                        const fileExample = path.join(opt.data.pathMssql, 'example.json')
                        fs.writeFile(fileExample, JSON.stringify(storeMssql.Example(), null, 4), {encoding: 'utf8'}, error => {
                            if (error) {
                                logger.error(`STORAGE`, error)
                            } else {
                                logger.debug(`STORAGE - create example mssql file ${fileExample}`)
                            }
                        })
                    }
                } else if (state.state === 'task') {
                    state.rows.forEach(row => {
                        tasks.push(storeTask.GetFromStorage(row))
                    })
                    if (tasks.length <= 0) {
                        const fileExample1 = path.join(opt.data.pathTask, 'example1.json')
                        const fileExample2 = path.join(opt.data.pathTask, 'example2.json')
                        fs.writeFile(fileExample1, JSON.stringify(storeTask.Example1(), null, 4), {encoding: 'utf8'}, error => {
                            if (error) {
                                logger.error(`STORAGE`, error)
                            } else {
                                logger.debug(`STORAGE - create example task file ${fileExample1}`)
                            }
                        })
                        fs.writeFile(fileExample2, JSON.stringify(storeTask.Example2(), null, 4), {encoding: 'utf8'}, error => {
                            if (error) {
                                logger.error(`STORAGE`, error)
                            } else {
                                logger.debug(`STORAGE - create example task file ${fileExample2}`)
                            }
                        })
                    }
                }
            })
            console.log(mssqls)
            console.log(tasks)
        })
    })

    depot.callback.onStateChange(states => {
        states.forEach(state => {
            if (state.state === 'mssql') {
                if (state.action === 'insert') {
                    state.rows.forEach(row => {
                        storeMssql.UpsertList(mssqls, storeMssql.GetFromStorage(row))
                    })
                } else if (state.action === 'delete') {
                    state.rows.forEach(row => {
                        storeMssql.SpliceList(mssqls, row.path, row.file)
                    })
                }
            } else if (state.state === 'task') {
                if (state.action === 'insert') {
                    state.rows.forEach(row => {
                        storeTask.UpsertList(tasks, storeTask.GetFromStorage(row))
                    })
                } else if (state.action === 'delete') {
                    state.rows.forEach(row => {
                        storeTask.SpliceList(tasks, row.path, row.file)
                    })
                }
            }
        })
        console.log(mssqls)
        console.log(tasks)
    })

    depot.start()
}