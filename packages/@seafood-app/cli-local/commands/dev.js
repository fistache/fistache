module.exports = (program, projectManager) => {
  program
    .command('dev')
    .allowUnknownOption()
    .action(() => {
      const express = require('express')
      const webpack = require('webpack')
      const provider = require('express-https-provider')()

      provider
        .modifyApp((app, state) => {
          projectManager.setMode('development')

          const chalk = require('chalk')

          const clientConfig = projectManager.webpack.getConfig('client')
          clientConfig.output.publicPath = '/'
          const clientCompiler = webpack(clientConfig)

          app.use(require('connect-history-api-fallback')())
          app.use(require('webpack-dev-middleware')(clientCompiler, {
            noInfo: true,
            logLevel: 'silent',
            publicPath: '/'
          }));
          app.use(require('webpack-hot-middleware')(clientCompiler, {
            log: false
          }))

          clientCompiler.hooks.done.tap('seafood dev', stats => {
            if (!stats.hasErrors()) {
              console.log(`App serving at: ${chalk.blue.bold(state.getServingLink())}`)
            }
          })
        })
        .run()
        .catch(err => console.error(err))
    });
}
