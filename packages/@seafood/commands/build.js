/**
 * The command to run development server.
 */
module.exports = (program, projectManager) => {
  program
    .command('build')
    .description('run development server')
    .allowUnknownOption()
    .action(() => {
      const webpack = require('webpack')
      const config = projectManager.webpackConfigManager.getConfig()

      const {console} = require('@seafood/project-manager')

      webpack(Object.assign(config, {
        mode: 'development',
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
