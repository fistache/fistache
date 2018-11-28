const compiler = require('@seafood/component-compiler')

module.exports = function(source) {
  // this.cacheable()

  let finish = this.async()
  // const loader = this

  compiler()
    .setCallback((error, component) => {
      finish(error, component)
    })
    .compile(source)
}
