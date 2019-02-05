module.exports = (config, mode, target) => {
  if (target === 'browser') {
    const path = require('path')
    const { WebpackSsrBrowserPlugin } = require('@seafood/ssr')

    config
      .entry('node-entry')
        .add(path.resolve(__dirname, '../../entry-browser.js'))
        .end()

    config
      .plugin('define-target')
      .use(require('webpack/lib/DefinePlugin'), [{
        'process.env.TARGET': `'${target}'`
      }])

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

    config
      .plugin('ssr-browser-bundle')
      .use(WebpackSsrBrowserPlugin)
  }
}
