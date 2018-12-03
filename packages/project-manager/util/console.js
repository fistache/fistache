const chalk = require('chalk')

const print = (message, callback) => {
  callback && callback(message || '')
}

const log = message => {
  print(message, message => {
    console.log(message)
  })
}

const error = message => {
  print(message, message => {
    console.log(chalk.white.bgRed(message))
  })
}

const warn = message => {
  print(message, message => {
    console.log(chalk.yellow(message))
  })
}

const success = message => {
  print(message, message => {
    console.log(chalk.black.bgGreen(message))
  })
}

module.exports = {
  log,
  error,
  warn,
  success
}
