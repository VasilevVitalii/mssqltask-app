import fs from 'fs'
import path from 'path'

type TOptions = {
    log: {
        path: string,
        lifeDays: number,
        allowTrace: boolean
    },
    data: {
        pathMssql: string,
        pathTask: string
    },
}

export function Read(fullFileName: string): TOptions {
    const dataRaw = fs.existsSync(fullFileName) ? fs.readFileSync(fullFileName, 'utf8') : undefined
    const dataJson = (dataRaw ? JSON.stringify(dataRaw) : {}) as TOptions

    const result = {
        log: {
            path: (dataJson?.log?.path || path.join(path.parse(fullFileName).dir, 'log')).replace(/\\/g, '/'),
            lifeDays: dataJson?.log?.lifeDays || 10,
            allowTrace: dataJson?.log?.allowTrace === true ? true : false
        },
        data: {
            pathMssql: (dataJson?.data?.pathMssql || path.join(path.parse(fullFileName).dir, 'data', 'mssql')).replace(/\\/g, '/'),
            pathTask: (dataJson?.data?.pathTask || path.join(path.parse(fullFileName).dir, 'data', 'task')).replace(/\\/g, '/'),
        }
    } as TOptions

    if (result.log.lifeDays <= 0) result.log.lifeDays = 1

    if (JSON.stringify(result, null, 4) !== dataRaw) {
        fs.writeFileSync(fullFileName, JSON.stringify(result, null, 4), 'utf8')
    }

    return result
}