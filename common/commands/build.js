module.exports = (program, projectManager) => {
  program
    .command('build')
    .allowUnknownOption()
    .action(() => {
      projectManager.setMode('production')

      const webpack = require('webpack')
      const config = projectManager.webpack.getConfig()

      webpack(config).run((err, stats) => {
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
