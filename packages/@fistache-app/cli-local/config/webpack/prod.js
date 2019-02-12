module.exports = (config, mode) => {
  if (mode === 'production') {
    config
      .mode('production')
      .devtool(false)

    config
      .plugin('define-target')
      .use(require('webpack/lib/DefinePlugin'), [{
        'process.env.NODE_ENV': JSON.stringify(mode)
      }])
  }
}
