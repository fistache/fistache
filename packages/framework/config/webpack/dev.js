module.exports = config => {
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    const merge = require('merge');

    config
      .mode('development')
      .devtool('cheap-module-eval-source-map')

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
