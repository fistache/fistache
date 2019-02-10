module.exports = (config, mode) => {
  if (mode !== 'production' && mode !== 'test') {
    const path = require('path')

    config
      .mode('development')
      .devtool('cheap-module-eval-source-map')

    config
      .plugin('define-target')
      .use(require('webpack/lib/DefinePlugin'), [{
        'process.env.NODE_ENV': JSON.stringify(mode)
      }])

    // https://github.com/webpack/webpack/issues/6642
    config
      .output
        .globalObject('this')

    config
      .plugin('hot')
        .use(require('webpack/lib/HotModuleReplacementPlugin'))

    config
      .plugin('no-emit-on-errors')
        .use(require('webpack/lib/NoEmitOnErrorsPlugin'))

    config
      .plugin('friendly-errors')
        .use(require('friendly-errors-webpack-plugin'))

    // config.module
    //   .rule('typescript')
    //     .use('babel-loader')
    //       .tap(options => merge(options, {
    //         cacheDirectory: true,
    //         cacheCompression: false
    //       }))

    config
      .plugin('html')
      .use(require('html-webpack-plugin'), [{
        template: path.resolve(__dirname, '../../index.html'),
        favicon: path.resolve('resources/images/logo/logo@32.png')
      }])

    config
      .plugin('fork-ts-checker')
        .use(require('fork-ts-checker-webpack-plugin'), [{
          tslint: true,
          checkSyntacticErrors: true
        }])
  }
}
