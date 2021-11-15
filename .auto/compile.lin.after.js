//@ts-check
const fs = require("fs-extra")
const path = require("path")
const vv = require('vv-common')
const AdmZip = require('adm-zip')
const ResEdit = require('resedit')
const s = require('./compile.shared')

process.exit()

/*
const exeFile = path.join(s.dirCompile('win'), 'mssqltask-app.exe')
const icoFile = path.join(s.dirAssets(), 'logo.ico')
const pjFile = path.join(s.dirDist(), 'package.json')

const pj = vv.PackajeJsonParse(fs.readFileSync(pjFile, 'utf8'))
const pjver = pj.version.split('.').map(m => { return parseInt(m) })

let data = fs.readFileSync(exeFile)
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
fs.writeFileSync(exeFile, Buffer.from(newBinary))

const description = fs.readFileSync(path.join(s.dirRoot(), 'description.txt'), 'utf8')
const readme = [
    '#ABOUT'
]
readme.push(`app "${pj.name}", version "${pj.version}"`)
readme.push(`license "${pj.license}"`)
if (pj.dependencies.length > 0) {
    readme.push(`dependencies`)
    pj.dependencies.forEach(d => {
        readme.push(`    "${d.package}", version "${d.version}"`)
    })
}
readme.push(`author "${pj.author}"`)
readme.push(`homepage "${pj.homepage}"`)
if (!vv.isEmpty(description)) {
    readme.push(description)
}
fs.writeFileSync(path.join(s.dirCompile('win'), 'readme.txt'), readme.join('\n'),'utf8')

// @ts-ignore
var zip = new AdmZip()
zip.addLocalFile(exeFile)
zip.addLocalFile(path.join(s.dirCompile('win'), 'readme.txt'))
zip.writeZip(path.join(s.dirCompile('win'), `mssqltask-app-win64-${pj.version.replace(/\./g, '-')}.zip`))

console.log('DONE!')
*/