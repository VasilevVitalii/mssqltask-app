//@ts-check
const fs = require("fs-extra")
const path = require("path")
const s = require('./compile.shared')
const { execSync } = require("child_process")
const AdmZip = require('adm-zip')
const ResEdit = require('resedit')
const vv = require('vv-common')

//build ui
fs.emptyDirSync(s.dirDistUi())

// const coreRestFullFileName = path.join(s.dirRootUi(), 'src', 'core', 'axios.ts')
// const coreRestText = fs.readFileSync(coreRestFullFileName, 'utf8')
// fs.writeFileSync(coreRestFullFileName, coreRestText.replace(`const replaceInCompileUrl = "http://localhost:3084"`, `const replaceInCompileUrl = window.location.protocol + '//' + window.location.host`) )

const understudyValuesFilaName = path.join(s.dirRootUi(), 'src', 'core', 'understudyValues.ts')
const understudyValuesText = fs.readFileSync(understudyValuesFilaName, 'utf8')
fs.writeFileSync(
    understudyValuesFilaName,
    understudyValuesText
        .replace(`export const values`, `export const valuesDev`)
        .replace(`export const valuesProd`, `export const values`)
)

execSync(`npm rebuild`, {cwd: s.dirRootUi() })
execSync(`npm run build`, {cwd: s.dirRootUi() })
fs.writeFileSync(understudyValuesFilaName, understudyValuesText)

//build backend
fs.emptyDirSync(s.dirDist())
fs.ensureDirSync(path.join(s.dirDist(), 'ui'))
execSync(`npm rebuild`, {cwd: s.dirRoot() })
execSync(`tsc`, {cwd: s.dirRoot() })
fs.copyFileSync(path.join(s.dirRoot(), 'package.json'), path.join(s.dirDist(), 'package.json'))
fs.copySync(s.dirDistUi(), path.join(s.dirDist(), 'ui'))

//compile
fs.emptyDirSync(s.dirCompile())
execSync(`pkg . --out-path compile --compress GZip`, {cwd: s.dirRoot() })

const exeFileWin = path.join(s.dirCompile(), 'mssqltask-app-win.exe')
const exeFileLin = path.join(s.dirCompile(), 'mssqltask-app-linux')
const icoFile = path.join(s.dirArtifacts(), 'logo.ico')
const pjFile = path.join(s.dirDist(), 'package.json')
const pj = vv.PackajeJsonParse(fs.readFileSync(pjFile, 'utf8'))
const pjver = pj.version.split('.').map(m => { return parseInt(m) })


let data = fs.readFileSync(exeFileWin)
let exe = ResEdit.NtExecutable.from(data)
let res = ResEdit.NtExecutableResource.from(exe)
let viList = ResEdit.Resource.VersionInfo.fromEntries(res.entries)
let vi = viList[0]

vi.removeStringValue({ lang: 1033, codepage: 1200 }, 'OriginalFilename')
vi.removeStringValue({ lang: 1033, codepage: 1200 }, 'InternalName')
vi.setProductVersion(pjver[0], pjver[1], pjver[2], 0, 1033)
vi.setFileVersion(pjver[0], pjver[1], pjver[2], 0, 1033)
vi.setStringValues(
    { lang: 1033, codepage: 1200 },
    {
        FileDescription: pj.description,
        ProductName: pj.name,
        CompanyName: pj.author,
        LegalCopyright: pj.author,
    }
)
vi.outputToResourceEntries(res.entries)

let iconFile = ResEdit.Data.IconFile.from(fs.readFileSync(icoFile))
ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
    res.entries,
    1,
    1033,
    iconFile.icons.map((item) => item.data)
)

res.outputResource(exe)
let newBinary = exe.generate()
fs.writeFileSync(exeFileWin, Buffer.from(newBinary))


// @ts-ignore
var zip1 = new AdmZip()
zip1.addLocalFile(exeFileWin)
zip1.addFile("readme.txt", s.readmeText('win'))
zip1.writeZip(path.join(s.dirCompile(), `mssqltask-app-win64-${pj.version.replace(/\./g, '-')}.zip`))

// @ts-ignore
var zip2 = new AdmZip()
zip2.addLocalFile(exeFileLin)
zip2.addFile("readme.txt", s.readmeText('lin'))
zip2.writeZip(path.join(s.dirCompile(), `mssqltask-app-linux-${pj.version.replace(/\./g, '-')}.zip`))

console.log('DONE!')
