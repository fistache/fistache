const ProjectManager = require('./src/ProjectManager')
const terminal = require('./util/terminal')
const process = require('./util/process')
const console = require('./util/console')

const glob = require('glob')
const path = require('path')

const getCommands = () => {
  let commands = {}

  glob.sync(path.resolve(__dirname, 'commands/**/*.js')).forEach(file => {
    const chainBuilder = require(path.resolve(file))
    const fileName = path.parse(file).name
    if (!commands.hasOwnProperty(fileName)) {
      commands[fileName] = chainBuilder
    }
  })

  return commands
}

const manage = rootDir => {
  const projectManager = new ProjectManager(rootDir)
  projectManager.manage()
}

module.exports = {
  ProjectManager,
  manage,
  terminal,
  process,
  console,
  commands: getCommands()
}
