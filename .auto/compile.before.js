//@ts-check
const fs = require("fs-extra")
const path = require("path")
const s = require('./compile.shared')

fs.ensureDirSync(s.dirCompile())
fs.emptyDirSync(s.dirCompile())
fs.copyFileSync(path.join(s.dirRoot(), 'package.json'), path.join(s.dirDist(), 'package.json'))
