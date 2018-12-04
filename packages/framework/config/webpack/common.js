const path = require('path')

module.exports = config => {
  config
    .cache(true)
    .target('node')
    .entry('index')
      // don't forget to add resolve paths
      .add(path.resolve(__dirname, '../../packages/component/index.ts'))
      .end()
    .output
      .libraryTarget('commonjs2')
      .path(path.resolve(__dirname, '../../packages/component/dist'))
      .filename('[name].js')
      .end()
      // .publicPath('/')
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
      .add(path.resolve(__dirname, '../../packages/component/node_modules'))
      .add(path.resolve(__dirname, '../../node_modules'))
      .end()

  config.resolveLoader
    .modules
      .add('node_modules')
      .add(path.resolve(__dirname, '../../packages/component/node_modules'))
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

  config
    .plugin('progress')
      .use(require('simple-progress-webpack-plugin'))
}
