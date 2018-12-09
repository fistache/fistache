// const HashedModuleIdsPlugin = require('webpack/lib/HashedModuleIdsPlugin');
// const TerserPlugin = require('terser-webpack-plugin')

module.exports = config => {
  if (process.env.NODE_ENV === 'production') {
    config
      .mode('production')
      .devtool(false)

    // config
    //   .plugin('hash-module-ids')
    //   .use(HashedModuleIdsPlugin, [{
    //     hashDigest: 'hex'
    //   }])
    //
    // config
    //   .optimization
    //   .minimizer([
    //     // new TerserPlugin()
    //   ])
  }
}
