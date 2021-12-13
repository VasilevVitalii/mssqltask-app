import path from 'path'
import fs from 'fs'
import * as vv from 'vv-common'
import { IApp } from 'backdepot'
import { Create as LoggerManagerCreate, ILogger } from 'vv-logger'
import * as options from './options'
import * as storeMssql from './depotMssql'
import * as storeTask from './depotTask'
import { Go as depotGo } from './depot'
import { Go as mssqltaskGo, TMssqlTask } from './mssqltask'
import { Go as apiGo } from './api'

const loggerManager = LoggerManagerCreate()
loggerManager.onError(error => {
    console.error(error)
})

export const env = {
    logger: undefined as ILogger,
    options: undefined as options.TOptions,
    depot: {
        app: undefined as IApp,
        timerRefresh: undefined as NodeJS.Timeout,
        mssql: {
            list: [] as storeMssql.TDepotMssql[],
            badList: [] as string[],
            isInit: false,
            isChange: false,
            isChangePrev: false,
        },
        task : {
            list: [] as storeTask.TDepotTask[],
            badList: [] as string[],
            isInit: false,
            isChange: false,
            isChangePrev: false,
        }
    },
    mssqltask: {
        timerRefresh: undefined as NodeJS.Timeout,
        needUpdate: false,
        list: [] as TMssqlTask[]
    }
}

export function Go(currentPath: string) {
    env.options = options.Read(currentPath)
    env.logger = loggerManager.addLogger ({
        consoleLevel: env.options.log.allowTrace ? 'trace' : 'debug',
        transports: [
            {kind: 'file', dir: env.options.log.path, levels: ['error'], fileNamePrefix: 'error', fileLifeDay: env.options.log.lifeDays},
            {kind: 'file', dir: env.options.log.path, levels: ['debug', 'error'], fileNamePrefix: 'debug', fileLifeDay: env.options.log.lifeDays},
            env.options.log.allowTrace ? {kind: 'file', dir: env.options.log.path, levels: ['trace', 'debug', 'error'], fileNamePrefix: 'trace', fileLifeDay: env.options.log.lifeDays} : undefined,
        ]
    })

    const packageJsonPath = fs.existsSync(path.join(__dirname, 'package.json')) ? path.join(__dirname, 'package.json') : undefined
    const packageJsonRaw = packageJsonPath ? fs.readFileSync(packageJsonPath, 'utf8') : '{}'
    const packageJson = vv.PackajeJsonParse(packageJsonRaw)

    env.logger.debug(`APP - start${packageJson.version ? ', version '.concat(packageJson.version) : ''}`)
    env.logger.debug(`APP - log.path "${env.options.log.path}"`)
    env.logger.debug(`APP - data.pathMssql "${env.options.data.pathMssql}"`)
    env.logger.debug(`APP - data.pathTask "${env.options.data.pathTask}"`)
    env.logger.debug(`APP - task.path "${env.options.task.path}"`)

    depotGo()
    mssqltaskGo()
    apiGo()
}