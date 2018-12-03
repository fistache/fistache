/**
 * The command to run development server.
 */
module.exports = (program, projectManager) => {
  program
    .command('serve')
    .description('run development server')
    .allowUnknownOption()
    .action(() => {
      const webpack = require('webpack')

      const provider = require('express-https-provider')()
      const history = require('connect-history-api-fallback')

      const chalk = require('chalk')
      const {console} = require('@seafood/project-manager')
      const {error, log} = console

      provider
        .modifyApp((app, state) => {
          // Start webpack compiler.
          const config = projectManager.webpackConfigManager.getConfig()
          const compiler = webpack(config)

          compiler.hooks.done.tap('seafood serve', stats => {
            if (!stats.hasErrors()) {
              log(`App serving at: ${chalk.blue.bold(state.getServingLink())}`)
            }
          })

          app.use(history())
          app.use(require('webpack-dev-middleware')(compiler, {
            noInfo: true,
            logLevel: 'silent',
            publicPath: '/'
          }));
          app.use(require('webpack-hot-middleware')(compiler, {
            log: false
          }))

          // Todo: Implement SSR rendering.
          app.get('/', (request, response) => {
            response.end('test string')
          })
        })
        .run()
        .catch(err => error(err))
    });
}
