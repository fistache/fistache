/**
 * The command to run development server.
 */
module.exports = (program, projectManager) => {
  program
    .command('build')
    .allowUnknownOption()
    .action(() => {
      projectManager.setMode('production')

      const webpack = require('webpack')
      const config = projectManager.webpackConfigManager.getConfig()

      const {console} = require('@seafood-app/webpack-kit')

      webpack(Object.assign(config, {
        mode: 'production',
      })).run((err, stats) => {
        if (err || stats.hasErrors()) {
          console.log(err || stats.toString({
            chunks: false,
            colors: true
          }))
          return
        }
      })
    });
}
