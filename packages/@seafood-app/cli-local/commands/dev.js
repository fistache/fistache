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
            JSON.parse(
              fs.readFileSync(path.resolve('dist/client.json'), 'utf-8')
            ).client.js,
            JSON.parse(
              fs.readFileSync(path.resolve('dist/server.json'), 'utf-8')
            ).server.js,
            fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8')
          )

          initializeApp(app, state, clientCompiler)

          app.get('*', async (request, response) => {
            response.setHeader("Content-Type", "text/html")
            response.send(
              await render(request.originalUrl)
            )
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

