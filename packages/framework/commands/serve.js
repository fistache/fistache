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
      const config = projectManager.webpackConfigManager.getConfig()

      const {console} = require('@seafood/project-manager')

      webpack(config.map(config => {
        return Object.assign(config, {
          mode: 'development',
        })
      })).watch({
        // watch options
      }, (err, stats) => {
        if (err || stats.hasErrors()) {
          console.log(err || stats.toString({
            chunks: false,
            colors: true
          }))
        }
      })
    });
}
