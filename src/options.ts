import fs from 'fs'
import path from 'path'

export type TOptions = {
    log: {
        path: string,
        lifeDays: number,
        allowTrace: boolean
    },
    data: {
        pathMssql: string,
        pathTask: string
    },
    task: {
        maxThreads: number,
        path: string
    },
    console: {
        allowApi: boolean
        allowUi: boolean
        passwordEdit: string,
        passwordView: string,
        http: string
    }
}

export function Read(currentPath: string): TOptions {
    const fullFileName = path.join(currentPath, 'mssqltask-app.json')
    const dataRaw = fs.existsSync(fullFileName) ? fs.readFileSync(fullFileName, 'utf8') : undefined
    const dataJson = (dataRaw ? JSON.parse(dataRaw) : {}) as TOptions

    const result: TOptions = {
        log: {
            path: (dataJson?.log?.path || path.join('log')).replace(/\\/g, '/'),
            lifeDays: dataJson?.log?.lifeDays || 10,
            allowTrace: dataJson?.log?.allowTrace === true ? true : false
        },
        data: {
            pathMssql: (dataJson?.data?.pathMssql || path.join('data', 'mssql')).replace(/\\/g, '/'),
            pathTask: (dataJson?.data?.pathTask || path.join('data', 'task')).replace(/\\/g, '/'),
        },
        task: {
            maxThreads: dataJson?.task?.maxThreads || 20,
            path: (dataJson?.task?.path || path.join('result')).replace(/\\/g, '/'),
        },
        console: {
            allowApi: dataJson?.console?.allowApi === true ? true : false,
            allowUi: dataJson?.console?.allowUi === true ? true : false,
            passwordEdit: dataJson?.console?.passwordEdit || '',
            passwordView: dataJson?.console?.passwordView || '',
            http: dataJson?.console?.http || 'http://localhost:3000',
        }
    }

    if (result.log.lifeDays <= 0) result.log.lifeDays = 1
    if (result.task.maxThreads <= 0) result.task.maxThreads = 1
    if (!result.console.allowApi) result.console.allowUi = false

    if (JSON.stringify(result, null, 4) !== dataRaw) {
        fs.writeFileSync(fullFileName, JSON.stringify(result, null, 4), 'utf8')
    }

    if (!path.isAbsolute(result.log.path)) result.log.path = path.join(currentPath, result.log.path)
    if (!path.isAbsolute(result.data.pathMssql)) result.data.pathMssql = path.join(currentPath, result.data.pathMssql)
    if (!path.isAbsolute(result.data.pathTask)) result.data.pathTask = path.join(currentPath, result.data.pathTask)
    if (!path.isAbsolute(result.task.path)) result.task.path = path.join(currentPath, result.task.path)

    return result
}