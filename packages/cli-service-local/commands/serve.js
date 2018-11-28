/**
 * The command to run development server.
 */
module.exports = program => {
  program
    .command('serve')
    .description('run development server')
    .allowUnknownOption()
    .action(async () => {
      const webpack = require('webpack')
      const {getChainableWebpackConfig} = require('../util/config')

      const provider = require('express-https-provider')()
      const history = require('connect-history-api-fallback')

      const chalk = require('chalk')
      const {error, log} = require('../util/console')

      provider
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
          app.get('/', (request, response) => {
            response.end('test string')
          })
        })
        .run()
        .catch(err => error(err))
    });
}
