module.exports = (config, mode, target) => {
  if (target === 'server') {
    const path = require('path')
    const nodeExternals = require('webpack-node-externals')

    config
      .target('node')
      .entry('server')
        .add(path.resolve('bootstrap/server.ts'))
        .end()
      .output
        .libraryTarget('commonjs2')
        .end()

    config
      .externals(nodeExternals({
        whitelist: /\.css$/
      }))

    config
      .plugin('define-target')
      .use(require('webpack/lib/DefinePlugin'), [{
        'process.env.TARGET': JSON.stringify(target)
      }])

    config
      .plugin('ssr-node-bundle')
      .use(require('assets-webpack-plugin'), [{
        useCompilerPath: true,
        filename: 'server.json',
        includeAllFileTypes: false,
        fileTypes: ['js'],
        update: mode === 'development',
        keepInMemory: mode === 'development',
        entrypoints: true,
      }])
  }
}
