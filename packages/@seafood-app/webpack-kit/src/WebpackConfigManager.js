const WebpackChainConfig = require('webpack-chain')

const path = require('path')
const fs = require('fs')

module.exports = class WebpackConfigManager {
  constructor(projectManager) {
    this.projectManager = projectManager
    this.branches = {}
    this.packages = []
    this.order = []
  }

  storePackages (packages) {
    if (!Array.isArray(packages)) {
      throw new Error('A parameter "packages" must be an array of function.')
    }

    this.packages = packages
  }

  storeFolder (folderPath, order) {
    if (typeof folderPath !== 'string') {
      throw new Error('A parameter "folderPath" must be a string.')
    }

    if (order && !Array.isArray(order)) {
      throw new Error('A parameter "order" must be an array of string.')
    } else {
      order = ['common', 'dev', 'prod']
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

  executeBranch (name, config) {
    if (this.branches.hasOwnProperty(name)) {
      const branch = this.branches[name]
      branch.forEach(chainBuilder => {
        chainBuilder(config)
      })
    }
  }

  getChain () {
    if (!this.packages.length) {
      this.packages = [chain => chain]
    }

    let configs = []

    this.packages.forEach(chainBuilder => {
      let config = new WebpackChainConfig
      this.order.forEach(branchName => {
        this.executeBranch(branchName, config)
      })

      for (const name in this.branches) {
        if (!this.order.includes(name)) {
          this.executeBranch(name, config)
        }
      }

      if (typeof chainBuilder !== 'function') {
        throw new Error('A parameter "pack" must be a function.')
      }

      chainBuilder(config)
      configs.push(config)
    })

    return configs
  }

  getConfig () {
    return this.getChain().map(config => {
      return config.toConfig()
    })
  }
}
