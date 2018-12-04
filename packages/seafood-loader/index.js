const qs = require('querystring')
const parse = require('./lib/parse')

module.exports = async function(source) {
  const context = this
  const finish = this.async()
  const {resourcePath, resourceQuery} = context
  const rawQuery = resourceQuery.slice(1)
  const incomingQuery = qs.parse(rawQuery)

  if (incomingQuery.type) {
    if (incomingQuery.type === 'script') {
      parse(context, source, (error, component) => {
        if (error) {
          finish(error)
          return
        }

        context.resourcePath += '.ts'
        finish(null, JSON.stringify(component.script))
      })
    }
  } else {
    const src = resourcePath
    const query = `?seafood&type=script`

    this.loadModule('!!seafood-loader!' + src + query, (error, source, sourceMap) => {
      if (error) {
        finish(error)
      }

      finish(error, JSON.parse(source))
    })
  }
}
