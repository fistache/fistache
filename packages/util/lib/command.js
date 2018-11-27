const glob = require('glob')
const path = require('path')

const executeEachInDirectory = (dir, callback) => {
  glob.sync(path.resolve(dir, '**/*.js')).forEach(file => {
    const definition = require(path.resolve(file))
    callback && callback(definition)
  })
}

module.exports = {
  executeEachInDirectory
}
