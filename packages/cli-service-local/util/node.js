const semver = require('semver')
const portfinder = require('portfinder')
const packageJson = require('../package.json')
const {error, warn} = require('./console')

const checkNodeVersion = () => {
  const requiredVersion = packageJson.engines && packageJson.engines.node
  if (!requiredVersion) {
    warn('No engine version requirement in package.json')
    return
  }

  const currentVersion = semver.clean(process.version)
  if (!semver.satisfies(currentVersion, requiredVersion)) {
    error(`Node version ${currentVersion} detected, ` +
      `but ${requiredVersion} required. Please install compatible ` +
      `node version and try again.`)
    process.exit(1)
  }
}

const addCloseEvent = (...servers) => {
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      servers.forEach(server => {
        server.close(() => {
          process.exit(0)
        })
      })
    })
  })
}

const mode = {
  isProduction() {
    return process.env.NODE_ENV === 'production'
  },
  isNotProduction() {
    return process.env.NODE_ENV !== 'production'
  }
}

module.exports = {
  checkNodeVersion,
  addCloseEvent,
  mode
}
