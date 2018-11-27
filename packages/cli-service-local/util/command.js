const glob = require('glob')
const path = require('path')

const defineCommands = callback => {
  glob.sync(path.resolve(__dirname, '../commands/**/*.js')).forEach(file => {
    const definition = require(path.resolve(file))
    callback && callback(definition)
  })
}

module.exports = {
  defineCommands
}
