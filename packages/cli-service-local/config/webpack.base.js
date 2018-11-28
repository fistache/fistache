const path = require('path');

module.exports = config => {
  config
    .cache(true)
    .entry('app')
      .add(path.resolve(__dirname, '../bootstrap/app.js'))
      .add(path.resolve('bootstrap/app.ts'))
      .end()
    .output
      .path(path.resolve('dist'))
      .filename('[name].js')
      // .publicPath('/')

  config.resolve
    .extensions
      .merge(['.ts', '.seafood', '.js', '.json'])
      .end()
    .modules
      .add('node_modules')
      .add(path.resolve('node_modules'))
      .add(path.resolve(__dirname, '../node_modules'))
      .end()
    .alias
      .set('@', path.resolve('src'))

  config.resolveLoader
    .modules
      .add('node_modules')
      .add(path.resolve('node_modules'))
      .add(path.resolve(__dirname, '../node_modules'))

  config.module
    .rule('html')
      .test(/\.html$/)
      .use('html-loader')
        .loader('html-loader')

  const appendTypeScriptLoaders = on => {
    on
      .use('cache-loader')
      .loader('cache-loader')
      .end()
      .use('babel-loader')
      .loader('babel-loader')
      .options({
        presets: [
          ['@babel/preset-env', { useBuiltIns: 'entry' }],
          '@babel/runtime'
        ]
      })
      .end()
      .use('ts-loader')
      .loader('ts-loader')
      .options({
        // transpileOnly: true
      })
  }

  appendTypeScriptLoaders(
    config.module
      .rule('typescript')
        .test(/\.ts$/)
        .include
          .add(path.resolve('app'))
          .add(path.resolve('src'))
          .add(path.resolve('test'))
          .end()
  )

  appendTypeScriptLoaders(
    config.module
      .rule('seafood')
        .test(/\.seafood$/)
          .use('seafood-loader')
          .loader('seafood-loader')
          .end()
  )

  config
    .plugin('html')
    .use(require('html-webpack-plugin'), [{
      template: path.resolve(__dirname, '../index.html')
    }])

  config
    .plugin('favicon')
    .use(require('favicons-webpack-plugin'), [{
      logo: path.resolve('src/resources/logo.svg'),
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
