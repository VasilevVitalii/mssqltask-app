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

/** @returns {string} */
function dirCompile() {
    return path.join(__dirname, "..", "compile")
}
exports.dirCompile = dirCompile

/** @returns {string} */
function dirAssets() {
    return path.join(__dirname, "..", "assets")
}
exports.dirAssets = dirAssets


