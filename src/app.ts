import path from 'path'
import fs from 'fs'
import { IApp } from 'backdepot'
import { Create as LoggerManagerCreate, ILogger } from 'vv-logger'
import * as mssqltask from 'mssqltask'
import * as options from './options'
import * as storeMssql from './depotMssql'
import * as storeTask from './depotTask'
import { Go as depotGo } from './depot'
import { Go as mssqltaskGo } from './mssqltask'

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
            list: [] as storeMssql.TMssql[],
            badList: [] as string[],
            isInit: false,
            isChange: false,
            isChangePrev: false,
        },
        task : {
            list: [] as storeTask.TTask[],
            badList: [] as string[],
            isInit: false,
            isChange: false,
            isChangePrev: false,
        }
    },
    mssqltask: {
        timerRefresh: undefined as NodeJS.Timeout,
        needUpdate: false,
        list: [] as {mssqltask: mssqltask.IApp, state: ('work' | 'stop' | 'remove')}[]
    }
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

    const packageJsonPath = fs.existsSync(path.join(currentPath, 'package.json')) ? path.join(currentPath, 'package.json') : (
        fs.existsSync(path.join(currentPath, '..', 'package.json')) ? path.join(currentPath, '..', 'package.json') : (
            fs.existsSync(path.join(currentPath, '..', '..', 'package.json')) ? path.join(currentPath, '..', '..', 'package.json') : undefined
        )
    )
    let appVer = undefined
    if (packageJsonPath) {
        try {
            appVer = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).version
        } catch (error) {
            env.logger.error(error as Error)
        }
    }
    env.logger.debug(`APP start${appVer ? ', version '.concat(appVer) : ''}`)

    depotGo()
    mssqltaskGo()
}