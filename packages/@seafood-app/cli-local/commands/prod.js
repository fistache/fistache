module.exports = (program, projectManager) => {
  program
    .command('prod')
    .description('run production server')
    .allowUnknownOption()
    .action(() => {
      const webpack = require('webpack')

      projectManager.setMode('production')

      const browserConfig = projectManager.webpackConfigManager.getConfig('browser')
      const nodeConfig = projectManager.webpackConfigManager.getConfig('node')

      webpack(browserConfig, handleStats)
      webpack(nodeConfig, handleStats)
    });
}

function handleStats(err, stats) {
  if (err || stats.hasErrors()) {
    console.error(stats.toString({
      colors: true,
      chunks: false
    }))
  }
  console.log('done')
}
