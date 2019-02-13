module.exports = (program, projectManager) => {
  program
    .command('dev')
    .allowUnknownOption()
    .action(() => {
      projectManager.setMode('development')

      const webpack = require('webpack')
      const express = require('express')
      const provider = require('express-https-provider')()

      provider
        .modifyApp((app, state) => {
          const path = require('path')
          const chalk = require('chalk')
          const favicon = require('serve-favicon')

          const clientConfig = projectManager.webpack.getConfig('client')
          clientConfig.output.publicPath = '/'
          const clientCompiler = webpack(clientConfig)

          app.use(require('connect-history-api-fallback')())
          app.use(require('webpack-dev-middleware')(clientCompiler, {
            noInfo: true,
            logLevel: 'silent',
            publicPath: clientConfig.output.publicPath
          }));
          app.use(require('webpack-hot-middleware')(clientCompiler, {
            log: false
          }))

          clientCompiler.hooks.done.tap('fistache dev', stats => {
            if (!stats.hasErrors()) {
              console.log(`App serving at: ${chalk.blue.bold(state.getServingLink())}`)
            }
          })

          app.use(favicon(path.resolve('resources/images/logo/logo@32.png')))
          app.use('/dist', express.static(path.resolve('dist')))
        })
        .run()
        .catch(err => console.error(err))
    });
}
