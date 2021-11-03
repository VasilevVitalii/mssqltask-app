//@ts-check
const fs = require("fs")
const path = require("path")
const packageFile = path.join(__dirname, "..", "package.json")
const packageRaw = fs.readFileSync(packageFile, "utf8")
const package = JSON.parse(packageRaw)
const version = package.version.split(".")
const versionMajor = Number(version[0])
let versionMinor = Number(version[1])
let versionPatch = Number(version[2]) + 1
if (versionPatch > 10) {
    versionMinor = versionMinor + 1
    versionPatch = 0
}
package.version = `${versionMajor}.${versionMinor}.${versionPatch}`
fs.writeFileSync(packageFile, JSON.stringify(package, null, 4), "utf8")
