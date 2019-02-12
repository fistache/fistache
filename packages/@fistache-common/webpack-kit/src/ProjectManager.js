const WebpackConfigManager = require('./WebpackConfigManager')
const CommandManager = require('./CommandManager')

const path = require('path')
const semver = require('semver')

module.exports = class ProjectManager {
  constructor (rootPath, configDir) {
    this.webpack = new WebpackConfigManager(this)
    this.commandManager = new CommandManager(this)
    this.mode = null
    this.target = null

    if(!rootPath || typeof rootPath !== 'string') {
      throw new Error('A parameter "rootPath" must be a string.')
    }

    this.rootPath = rootPath
    this.configDir = configDir
  }

  setMode(mode) {
    this.mode = mode
  }

  setTarget(target) {
    this.target = target
  }

  getMode() {
    return this.mode
  }

  getTarget() {
    return this.target
  }

  manage () {
    this.verifyNodeVersion()
    this.defineCommands()
    this.defineConfig()

    if (this.configDir) {
      process.chdir(this.configDir)
    }

    this.commandManager.manage()
  }

  verifyNodeVersion () {
    const packageJson = require(this.generateRootPath('package.json'))
    const requiredVersion = packageJson.engines && packageJson.engines.node
    if (!requiredVersion) {
      console.error('No engine version requirement in package.json')
      return this
    }

    const currentVersion = semver.clean(process.version)
    if (!semver.satisfies(currentVersion, requiredVersion)) {
      error(`Node version ${currentVersion} detected, ` +
        `but ${requiredVersion} required. Please install compatible ` +
        `node version and try again.`)
      process.exit(1)
    }

    return this
  }

  defineCommands (folderPath) {
    if (!folderPath) {
      folderPath = this.generatePath('commands')
    }

    this.commandManager.storeFolder(folderPath)

    return this
  }

  defineConfig (folderPath) {
    if (!folderPath) {
      folderPath = this.generatePath('config/webpack')
    }

    this.webpack.storeFolder(folderPath)

    return this
  }

  generateRootPath (to) {
    return this.generatePath(to, this.rootPath)
  }

  generatePath (to, from) {
    return path.join(from || this.configDir || this.rootPath, to)
  }
}
