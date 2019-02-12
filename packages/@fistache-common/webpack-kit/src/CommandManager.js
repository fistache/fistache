const path = require('path')
const glob = require('glob')
const program = require('commander')

module.exports = class CommandManager {
  constructor (projectManager) {
    this.projectManager = projectManager
    this.commands = []
    this.program = program
  }

  storeFolder (folderPath) {
    if (typeof folderPath !== 'string') {
      throw new Error('A parameter "folderPath" must be a string.')
    }

    glob.sync(path.resolve(folderPath, '**/*.js')).forEach(file => {
      const chainBuilder = require(path.resolve(file))
      chainBuilder(this.program, this.projectManager)
    })
  }

  manage () {
    this.program.parse(process.argv)
  }
}
