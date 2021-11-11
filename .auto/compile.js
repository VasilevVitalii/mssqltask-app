//@ts-check
const fs = require("fs-extra")
const path = require("path")
const { exec } = require('pkg')
const zip = require('adm-zip')

const rootDir = path.join(__dirname, "..")
const compileDir = path.join(rootDir, "compile")
const compileTempDir = path.join(compileDir, "temp")

const sourceDir = path.join(rootDir, "dist", "src")

const packageFile = path.join(rootDir, "package.json")
const packageRaw = fs.readFileSync(packageFile, "utf8")
const package = JSON.parse(packageRaw)
const version = package.version

fs.ensureDirSync(compileDir)
fs.ensureDirSync(compileTempDir)
fs.emptyDirSync(compileTempDir)

async function go () {
    await exec(
        [path.join(sourceDir, 'index.js'),
        '--t', 'node12-win-x64',
        '--output', path.join(compileTempDir, 'mssqltask-app.exe')
    ])
    // @ts-ignore
    // let zip_win = new zip()
    // zip_win.addLocalFile(path.join(compileTempDir, 'mssqltask-app.exe'))
    // zip_win.writeZip(path.join(compileDir, `mssqltask-app.${version}.zip`), error => {
    //     if (error) {
    //         console.warn('Error create zip:')
    //         console.warn(error)
    //         process.exit()
    //     }
    //     console.log(`BUILD VERSION "${version}" DONE`)
    // })
}

go()