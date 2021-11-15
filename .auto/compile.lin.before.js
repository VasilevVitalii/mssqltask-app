//@ts-check
const fs = require("fs-extra")
const path = require("path")
const s = require('./compile.shared')

fs.ensureDirSync(s.dirCompile('lin'))
fs.emptyDirSync(s.dirCompile('lin'))
fs.copyFileSync(path.join(s.dirRoot(), 'package.json'), path.join(s.dirDist(), 'package.json'))
