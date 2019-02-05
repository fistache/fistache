module.exports = (config, mode, target) => {
  if (target === 'node') {
    const path = require('path')
    const {WebpackSsrNodePlugin} = require('@seafood/ssr')
    const nodeExternals = require('webpack-node-externals')

    config
      .target('node')
      .entry('node-entry')
        .add(path.resolve(__dirname, '../../entry-node.js'))
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
        'process.env.TARGET': `'${target}'`
      }])

    config
      .plugin('ssr-node-bundle')
      .use(WebpackSsrNodePlugin)
  }
}
