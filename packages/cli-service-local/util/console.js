const chalk = require('chalk')
const ora = require('ora')

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

const spinner = text => {
  const spinner = ora({
    text,
    spinner: {
      interval: 80,
      frames: [
        "-",
        "\\",
        "|",
        "/"
      ]
    },
    color: 'black'
  })
  return spinner.start()
}

module.exports = {
  log,
  error,
  warn,
  success,
  spinner
}
