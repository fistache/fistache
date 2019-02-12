const WebpackChainConfig = require('webpack-chain')

const glob = require('glob')
const path = require('path')
const fs = require('fs')

module.exports = class WebpackConfigManager {
  constructor(projectManager) {
    this.projectManager = projectManager
    this.files = {}
    this.order = []
  }

  storeFolder (folderPath) {
    if (typeof folderPath !== 'string') {
      throw new Error('A parameter "folderPath" must be a string.')
    }

    glob.sync(path.resolve(folderPath, '**/*.js')).forEach(file => {
      const filePath = path.resolve(file)
      if (fs.existsSync(filePath)) {
        this.store(filePath, require(filePath))
      }
    })
  }

  store (branchName, chainBuilder) {
    if (typeof branchName !== 'string') {
      throw new Error('A parameter "branchName" must be a string.')
    }

    if (typeof chainBuilder !== 'function') {
      throw new Error('A parameter "chainBuilder" must be a function.')
    }

    if (!this.files.hasOwnProperty(branchName)) {
      this.files[branchName] = []
    }

    this.files[branchName].push(chainBuilder)

    return this
  }

  order (list) {
    if (!Array.isArray(list)) {
      throw new Error ('A parameter "list" must be an array of string.')
    }

    this.order = list
  }

  executeBranch (branch, config, target) {
    branch.forEach(chainBuilder => {
      chainBuilder(config, this.projectManager.getMode(), target || this.projectManager.getTarget())
    })
  }

  addDefaultConfigProperties (config) {
    if (this.projectManager.configDir) {
      config
        .entry('index')
          .add(path.resolve(this.projectManager.rootPath, 'index.ts'))
          .end()
        .output
          .path(path.resolve(this.projectManager.rootPath, 'dist'))
          .end()
    }

    config.resolve
      .modules
        .add(path.resolve(this.projectManager.rootPath, 'node_modules'))
        .add(path.resolve(__dirname, '../node_modules'))
        .end()

    config.resolveLoader
      .modules
        .add(path.resolve(this.projectManager.rootPath, 'node_modules'))
        .add(path.resolve(__dirname, '../node_modules'))
        .end()
  }

  getChain (target) {
    let config = new WebpackChainConfig

    for (const name in this.files) {
      if (this.files.hasOwnProperty(name)) {

        this.executeBranch(this.files[name], config, target)
        this.addDefaultConfigProperties(config)
      }
    }

    return config
  }

  getConfig (target) {
    return this.getChain(target).toConfig()
  }
}
