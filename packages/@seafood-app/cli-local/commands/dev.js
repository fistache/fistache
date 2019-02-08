module.exports = (program, projectManager) => {
  program
    .command('dev')
    .description('run development server')
    .allowUnknownOption()
    .action(() => {
      const webpack = require('webpack')
      const provider = require('express-https-provider')()
      const {console} = require('@seafood-app/webpack-kit')

      provider
        .modifyApp((app, state) => {
          projectManager.setMode('development')

          const fs = require('fs')
          const path = require('path')
          const { createRenderer } = require('@seafood/ssr')

          const clientConfig = projectManager.webpack.getConfig('client')
          const clientCompiler = webpack(clientConfig)

          const render = createRenderer(
            fs.readFileSync(path.resolve('dist/server.json'), 'utf-8'),
            fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8')
          )

          initializeApp(app, state, clientCompiler)

          app.get('*', (request, response) => {
            const html = render(
              `${request.protocol}://${request.hostname}${request.originalUrl}`
            )

            response.setHeader("Content-Type", "text/html")
            response.send(html)
          })
        })
        .run()
        .catch(err => console.error(err))
    });
}

function initializeApp(app, state, clientCompiler) {
  const chalk = require('chalk')
  const history = require('connect-history-api-fallback')

  clientCompiler.hooks.done.tap('seafood dev', stats => {
    if (!stats.hasErrors()) {
      console.log(`App serving at: ${chalk.blue.bold(state.getServingLink())}`)
    }
  })

  app.use(history())
  app.use(require('webpack-dev-middleware')(clientCompiler, {
    noInfo: true,
    logLevel: 'silent',
    publicPath: '/'
  }));
  app.use(require('webpack-hot-middleware')(clientCompiler, {
    log: false
  }))
}

