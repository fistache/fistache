const compiler = require('../src/Compiler')

module.exports = async (context, source, callback) => {
  compiler()
    .setLoaderContext(context)
    .setCallback((error, component) => {
      if (error) {
        callback(error)
      }

      callback(null, component)
    })
    .compile(source)
}
