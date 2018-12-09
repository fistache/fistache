const path = require('path');

module.exports = config => {
  config
    .cache(true)
    .entry('app')
      .add(path.resolve(__dirname,  '../../index.js'))
      .add(path.resolve('bootstrap/app.ts'))
      .end()
    .output
      .path(path.resolve('dist'))
      .filename('[name].js')
      .publicPath('/')

  config.node
    .merge({
      // prevent webpack from injecting mocks to Node native modules
      // that does not make sense for the client
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty'
    })

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
    // .exclude
    //   .add(path.resolve('node_modules'))
    //   .add(path.resolve(__dirname, '../../node_modules'))
    //   .end()
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
    .plugin('html')
    .use(require('html-webpack-plugin'), [{
      template: path.resolve(__dirname, '../../index.html')
    }])

  config
    .plugin('favicon')
    .use(require('favicons-webpack-plugin'), [{
      logo: path.resolve('resources/images/logo.svg'),
      background: false,
      icons: {
        android: true,
        appleIcon: true,
        appleStartup: true,
        favicons: true,
        firefox: true,
        coast: false,
        opengraph: false,
        twitter: false,
        yandex: false,
        windows: false
      }
    }])

  config
    .plugin('progress')
    .use(require('simple-progress-webpack-plugin'))
}
