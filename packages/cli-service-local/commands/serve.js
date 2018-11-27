/**
 * The command to run development server.
 */
module.exports = program => {
  program
    .command('serve')
    .description('run development server')
    .action(async () => {
      const webpack = require('webpack')
      const {getChainableWebpackConfig} = require('../util/config')

      const server = require('express-trusted-ssl')()
      const history = require('connect-history-api-fallback')

      const chalk = require('chalk')
      const {error, log} = require('../util/console')

      server
        .modifyApp((app, state) => {
          // Start webpack compiler.
          const config = getChainableWebpackConfig().toConfig()
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
          // Routes must be after history and etc...
          app.get('/', (request, response) => {
            response.end('test string')
          })
        })
        .run()
        .catch(err => error(err))
    });
}
