module.exports = (config, mode) => {
  if (mode !== 'production' && mode !== 'test') {
    config
      .mode('development')
      .devtool('cheap-module-eval-source-map')

    config
      .plugin('define-target')
      .use(require('webpack/lib/DefinePlugin'), [{
        'process.env.NODE_ENV': `'${mode}'`
      }])

    config.module
      .rule('ts-lint')
        .test(/\.ts$/)
        .enforce('pre')
        .use('tslint-loader')
          .loader('tslint-loader')
          .end()

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

    // config
    //   .plugin('fork-ts-checker')
    //     .use(require('fork-ts-checker-webpack-plugin'), [{
    //       tslint: true,
    //       // checkSyntacticErrors: true
    //     }])
  }
}
