const mode = {
  isProduction() {
    return process.env.NODE_ENV === 'production'
  },
  isNotProduction() {
    return process.env.NODE_ENV !== 'production'
  }
}

module.exports = {
  mode
}
