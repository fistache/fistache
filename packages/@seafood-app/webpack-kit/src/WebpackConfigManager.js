const WebpackChainConfig = require('webpack-chain')

const path = require('path')
const fs = require('fs')

module.exports = class WebpackConfigManager {
  constructor(projectManager) {
    this.projectManager = projectManager
    this.branches = {}
    this.order = []
  }

  storeFolder (folderPath, order) {
    if (typeof folderPath !== 'string') {
      throw new Error('A parameter "folderPath" must be a string.')
    }

    if (order && !Array.isArray(order)) {
      throw new Error('A parameter "order" must be an array of string.')
    } else {
      order = ['common', 'browser', 'node', 'dev', 'prod']
    }

    this.order = order
    this.order.forEach(branchName => {
      const filePath = path.join(folderPath, branchName)
      if (fs.existsSync(`${filePath}.js`)) {
        this.store(branchName, require(filePath))
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

    if (!this.branches.hasOwnProperty(branchName)) {
      this.branches[branchName] = []
    }

    this.branches[branchName].push(chainBuilder)

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
    config.resolve
      .modules
        .add(path.resolve(__dirname, '../node_modules'))
        .end()

    config.resolveLoader
      .modules
        .add(path.resolve(__dirname, '../node_modules'))
        .end()
  }

  getChain (target) {
    let config = new WebpackChainConfig

    for (const name in this.branches) {
      if (this.branches.hasOwnProperty(name)) {

        this.executeBranch(this.branches[name], config, target)
        this.addDefaultConfigProperties(config)
      }
    }

    return config
  }

  getConfig (target) {
    return this.getChain(target).toConfig()
  }
}
