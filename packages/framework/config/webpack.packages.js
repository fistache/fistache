const path = require('path')

const createPackageChainableConfig = packageName => {
  return config => {
    config
      .entry(packageName)
        .add(path.resolve(__dirname, `../packages/${packageName}/index.ts`))
        .end()
      .output
        .path(path.resolve(__dirname, `../packages/${packageName}/dist`))
        .end()

    config.resolve
      .modules
        .add(path.resolve(__dirname, `../packages/${packageName}/node_modules`))
        .end()

    config.resolveLoader
      .modules
        .add(path.resolve(__dirname, `../packages/${packageName}/node_modules`))
        .end()
  }
}

module.exports = [
  createPackageChainableConfig('app'),
  createPackageChainableConfig('component'),
]
