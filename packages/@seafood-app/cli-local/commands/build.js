module.exports = (program, projectManager) => {
  program
    .command('build')
    .allowUnknownOption()
    .action(() => {
      const webpack = require('webpack')
      const path = require('path')
      const rmfr = require('rmfr')

      rmfr(path.resolve('dist'))

      projectManager.setMode('production')

      const clientConfig = projectManager.webpack.getConfig('client')
      const serverConfig = projectManager.webpack.getConfig('server')

      webpack(clientConfig, handleStats)
      webpack(serverConfig, handleStats)
    });
}

function handleStats(err, stats) {
  if (err || stats.hasErrors()) {
    console.error(stats.toString({
      colors: true,
      chunks: false
    }))
  }
}
