module.exports = config => {
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    const merge = require('merge');

    config
      .mode('development')
      .entry('app')
        .add('webpack-hot-middleware/client')
        .end()
      .devtool('cheap-module-eval-source-map')

    config
      .devServer
        .compress(false)
        .contentBase('public')
        .hot(true)
        // .https(true)
        .open(true) // todo: add to .env file
        .overlay({
          warnings: true,
          errors: true
        })
        .port(8080) // todo: add to .env file
        // .proxy for API ???
        // .public for proxy. read webpack docs for more info
        // .progress(true)
        .quiet(true)
        .stats('none')

    // https://github.com/webpack/webpack/issues/6642
    config
      .output
        .globalObject('this')

    config
      .plugin('favicon')
      .tap(args => [merge(...args, {
        icons: {
          favicons: true,
          android: false,
          appleIcon: false,
          appleStartup: false,
          coast: false,
          firefox: false,
          opengraph: false,
          twitter: false,
          yandex: false,
          windows: false
        }
      })])

    config
      .plugin('hot')
        .use(require('webpack/lib/HotModuleReplacementPlugin'))

    config
      .plugin('no-emit-on-errors')
        .use(require('webpack/lib/NoEmitOnErrorsPlugin'))

    config
      .plugin('friendly-errors')
        .use(require('friendly-errors-webpack-plugin'))

    config.module
      .rule('typescript')
        .use('babel-loader')
          .tap(options => merge(options, {
            cacheDirectory: true,
            cacheCompression: false
          }))

    // config
    //   .plugin('fork-ts-checker')
    //     .use(require('fork-ts-checker-webpack-plugin'), [{
    //       tslint: true,
    //       checkSyntacticErrors: true
    //     }])
  }
}
