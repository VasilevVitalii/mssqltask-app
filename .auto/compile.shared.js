const path = require("path")

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
 * @param {'win' | 'lin'} os
 * @returns {string}
 *  */
function dirCompile(os) {
    if (os === 'win') return path.join(__dirname, "..", "compile-win")
    if (os === 'lin') return path.join(__dirname, "..", "compile-lin")
    return '???'
}
exports.dirCompile = dirCompile

/** @returns {string} */
function dirAssets() {
    return path.join(__dirname, "..", "assets")
}
exports.dirAssets = dirAssets


