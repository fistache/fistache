module.exports = config => {
  if (process.env.NODE_ENV === 'production') {
    config
      .mode('production')
      .devtool(false)
  }
}
