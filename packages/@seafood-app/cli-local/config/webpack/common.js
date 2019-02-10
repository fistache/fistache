const path = require('path');

module.exports = (config, mode, target) => {
  const ifdefOptions = {
    // todo: DEBUG
    PROD: mode === 'production',
    DEV: mode !== 'production',
    TARGET: target,
    SERVER: target === 'server',
    CLIENT: target === 'client',
  }

  config
    // .cache(true)
    .output
      .chunkFilename('[id].[name].js')
      .filename('[name].js')
      .path(path.resolve('dist'))
      .publicPath('/dist')
      .end()
    .node
      .set('__dirname', true)
      .set('__filename', true)

  config.resolve
    .symlinks(true)
    .extensions
      .merge(['.ts', '.seafood', '.js', '.json'])
      .end()
    .modules
      .add(path.resolve('node_modules'))
      .add('node_modules')
      .add(path.resolve(__dirname, '../../node_modules'))
      .end()

  config.resolveLoader
    .modules
      .add(path.resolve('node_modules'))
      .add('node_modules')
      .add(path.resolve(__dirname, '../../node_modules'))

  config.module
    .rule('html')
      .test(/\.html$/)
      .use('html-loader')
        .loader('html-loader')

  config.module
    .rule('style')
      .test(/\.styl$/)
      .use('css-loader')
        .loader('css-loader')
        .end()
      .use('stylus-loader')
        .loader('stylus-loader')
        .end()

  config.module
    .rule('seafood')
      .test(/\.seafood$/)
      .exclude
        .add(path.resolve('node_modules'))
        .add(path.resolve(__dirname, '../../node_modules'))
        .end()
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
      .use('@seafood/loader')
        .loader('@seafood/loader')
        .options({
          styleRules: config.module.rule('style').toConfig(),
          styleResourcesFile: path.resolve('resources/style/resources.styl')
        })
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
    .exclude
      .add(path.resolve('node_modules'))
      .add(path.resolve(__dirname, '../../node_modules'))
      .end()
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
