module.exports = (config, mode, target) => {
  if (target === 'client') {
    const path = require('path')

    config
      .entry('client')
        .add(path.resolve('bootstrap/client.ts'))
        .end()

    if (mode === 'development') {
      config
        .entry('client')
          .add('webpack-hot-middleware/client')
          .end()
    }

  config
    .plugin('define-target')
    .use(require('webpack/lib/DefinePlugin'), [{
      'process.env.TARGET': JSON.stringify(target)
    }])

    config
      .optimization
      .runtimeChunk('single')
      .splitChunks({
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          },
        }
      })

    config
      .plugin('ssr-browser-bundle')
      .use(require('assets-webpack-plugin'), [{
        useCompilerPath: true,
        filename: 'client.json',
        includeManifest: 'manifest',
        manifestFirst: true,
        includeAllFileTypes: false,
        fileTypes: ['js'],
        update: mode === 'development',
        keepInMemory: mode === 'development',
        entrypoints: true,
      }])
  }
}
