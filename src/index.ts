import path from 'path'
import * as app from './app'
const currentPath = path.parse(process.execPath).dir
app.Go(currentPath)


