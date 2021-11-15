//@ts-check
const path = require("path")
const fs = require('fs')
const vv = require('vv-common')

/** @returns {string} */
function dirRoot() {
    return path.join(__dirname, "..")
}
exports.dirRoot = dirRoot

/** @returns {string} */
function dirDist() {
    return path.join(__dirname, "..", "dist", "src")
}
exports.dirDist = dirDist

/**
 * @returns {string}
 *  */
function dirCompile() {
    return path.join(__dirname, "..", "compile")
}
exports.dirCompile = dirCompile

/** @returns {string} */
function dirArtifacts() {
    return path.join(__dirname, "..", "artifacts")
}
exports.dirArtifacts = dirArtifacts

/**
 * @param {'win' | 'lin'} os
 * @returns {string}
 */
function readmeText(os) {
    const pj = vv.PackajeJsonParse(fs.readFileSync(path.join(dirDist(), 'package.json'), 'utf8'))
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

    if (os === 'win') {
        const t = fs.readFileSync(path.join(dirArtifacts(), 'docs', 'description-win.txt'), 'utf8')
        if (t.trim().length > 0) {
            readme.push(t)
        }
    }
    if (os === 'lin') {
        const t = fs.readFileSync(path.join(dirArtifacts(), 'docs', 'description-linux.txt'), 'utf8')
        if (t.trim().length > 0) {
            readme.push(t)
        }
    }
    const t = fs.readFileSync(path.join(dirArtifacts(), 'docs', 'description.txt'), 'utf8')
    if (t.trim().length > 0) {
        readme.push(t)
    }
    return readme.join('\n')
}
exports.readmeText = readmeText