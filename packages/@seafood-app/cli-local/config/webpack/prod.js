// const HashedModuleIdsPlugin = require('webpack/lib/HashedModuleIdsPlugin');
// const TerserPlugin = require('terser-webpack-plugin')

module.exports = config => {
  if (process.env.NODE_ENV === 'production') {
    config
      .mode('production')
      .devtool(false)

    config
      .plugin('favicon')
      .use(require('favicons-webpack-plugin'), [{
        logo: path.resolve('resources/images/logo/logo.svg'),
        background: false,
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: true,
          favicons: true,
          firefox: true,
          coast: false,
          opengraph: false,
          twitter: false,
          yandex: false,
          windows: false
        }
      }])

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
