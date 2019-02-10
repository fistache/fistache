const path = require('path')

module.exports = config => {
  const ifdefOptions = {
    DEBUG: process.env.NODE_ENV !== 'production',
  }

  config
    .cache(true)
    .entry('index')
      .add(path.resolve(__dirname, '../../index.ts'))
      .end()
    .target('node')
    .output
      .path(path.resolve(__dirname, '../../dist'))
      .libraryTarget('commonjs2')
      .filename('[name].js')
      .end()
    .node
      .set('__dirname', false)
      .set('__filename', false)

  config.resolve
    .symlinks(true)
    .extensions
      .merge(['.ts', '.seafood', '.js', '.json'])
      .end()
    .modules
      .add('node_modules')
      .add(path.resolve(__dirname, '../../node_modules'))
      .end()

  config.resolveLoader
    .modules
      .add('node_modules')
      .add(path.resolve(__dirname, '../../node_modules'))

  config.module
    .rule('seafood')
      .test(/\.seafood$/)
      .use('babel-loader')
        .loader('babel-loader')
        .options({
          babelrc: true
        })
        .end()
      .use('ts-loader')
        .loader('ts-loader')
        .options({
          transpileOnly: true,
          appendTsSuffixTo: ['\\.seafood$']
        })
        .end()
      .use('ifdef-loader')
        .loader('ifdef-loader')
        .options(ifdefOptions)
        .end()
      .use('seafood-loader')
        .loader('seafood-loader')
        .end()

  config.module
    .rule('typescript')
      .test(/\.ts$/)
      .exclude
        .add(path.resolve('node_modules'))
        .add(path.resolve(__dirname, '../../node_modules'))
        .end()
      // .use('cache-loader')
      //   .loader('cache-loader')
      //   .end()
      .use('babel-loader')
        .loader('babel-loader')
        .options({
          babelrc: true
        })
        .end()
      .use('ts-loader')
        .loader('ts-loader')
        .options({
          transpileOnly: true
        })
        .end()
      .use('ifdef-loader')
        .loader('ifdef-loader')
        .options(ifdefOptions)
        .end()

  config.module
    .rule('javascript')
    .test(/\.js$/)
    // .exclude
    //   .add(path.resolve('node_modules'))
    //   .add(path.resolve(__dirname, '../../node_modules'))
    //   .end()
    .use('babel-loader')
      .loader('babel-loader')
      .options({
        babelrc: true
      })
      .end()
    .use('ifdef-loader')
      .loader('ifdef-loader')
      .options(ifdefOptions)
      .end()

  config
    .plugin('progress')
      .use(require('simple-progress-webpack-plugin'))
}
