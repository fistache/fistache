const WebpackChain = require('webpack-chain')

const getChainableWebpackConfig = () => {
  const config = new WebpackChain()

  require('../config/webpack.base')(config)
  require('../config/webpack.dev')(config)
  require('../config/webpack.prod')(config)

  return config
}

module.exports = {
  getChainableWebpackConfig
}
