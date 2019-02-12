module.exports = (program, projectManager) => {
  program
    .command('serve')
    .allowUnknownOption()
    .action(() => {
      projectManager.setMode('development')

      const webpack = require('webpack')
      const config = projectManager.webpack.getConfig()

      webpack(config).watch({
        hot: false,
        inline: false,
      }, (err, stats) => {
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
