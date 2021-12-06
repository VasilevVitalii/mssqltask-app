module.exports = {
    configureWebpack: {
        devtool: "source-map"
    },
    pluginOptions: {
        quasar: {
            importStrategy: "kebab",
            rtlSupport: false
        }
    },
    transpileDependencies: ["quasar"]
}
