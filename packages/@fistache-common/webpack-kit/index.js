const ProjectManager = require('./src/ProjectManager')

const manage = (rootDir, configDir) => {
  const projectManager = new ProjectManager(rootDir, configDir)
  projectManager.manage()
}

module.exports = {
  manage
}
