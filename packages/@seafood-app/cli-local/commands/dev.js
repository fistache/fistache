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

          const browserConfig = projectManager.webpackConfigManager.getConfig('broswer')
          const nodeConfig = projectManager.webpackConfigManager.getConfig('node')

          const browserCompiler = webpack(browserConfig)
          const nodeCompiler = webpack(nodeConfig)

          initializeApp(app, state, browserCompiler, nodeCompiler)

          app.get('*', (request, response) => {
            // const indexHtml = fs.readFileSync(
            //   path.resolve('dist/index.html')
            // )
            response.end('hello')
          })
        })
        .run()
        .catch(err => console.error(err))
    });
}

function initializeApp(app, state, browserCompiler, nodeCompiler) {
  // const chalk = require('chalk')
  const history = require('connect-history-api-fallback')

  // browserCompiler.hooks.done.tap('seafood serve', stats => {
  //   if (!stats.hasErrors()) {
  //     console.log(`App serving at: ${chalk.blue.bold(state.getServingLink())}`)
  //   }
  // })

  app.use(history())
  addCompilerMiddleware(app, browserCompiler)
  addCompilerMiddleware(app, nodeCompiler)
}

function addCompilerMiddleware(app, compiler) {
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    logLevel: 'silent',
    publicPath: '/'
  }));
  app.use(require('webpack-hot-middleware')(compiler, {
    log: false
  }))
}
