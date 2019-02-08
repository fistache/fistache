module.exports = (program, projectManager) => {
  program
    .command('prod')
    .description('run production server')
    .allowUnknownOption()
    .action(() => {
      const webpack = require('webpack')
      const path = require('path')
      const rmfr = require('rmfr')

      rmfr(path.resolve('dist'))

      // projectManager.setMode('production')
      projectManager.setMode('develop')

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
