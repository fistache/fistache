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
      const config = projectManager.webpack.getConfig()

      const {console} = require('@fistache-app/webpack-kit')

      webpack(config).watch({
        hot: false,
        inline: false,
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
