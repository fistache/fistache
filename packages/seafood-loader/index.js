const qs = require('querystring')
const loaderUtils = require('loader-utils')
const parse = require('./lib/parse')

module.exports = async function(source) {
  const context = this
  const finish = this.async()
  const {resourcePath, resourceQuery} = context
  const rawQuery = resourceQuery.slice(1)
  const incomingQuery = qs.parse(rawQuery)

  if (incomingQuery.compile) {
    parse(context, source.toString('utf8'), (error, component) => {
      if (error) {
        finish(error)
        return
      }

      context.resourcePath += '.ts'
      finish(null, component)
    })
  } else {
    const query = `?seafood&compile=true`
    const loaders = this.loaders.slice()
    const request = loaderUtils.stringifyRequest(context, generateLoaders(loaders,resourcePath + query))

    finish(null,
      `import {default as BaseComponent, $renderContent, $render} from ${request}
      
      class CompiledComponent extends BaseComponent {
        public $render(context) {
          $render(context, $renderContent)
        }
      }
      
      export default new CompiledComponent`
    )
  }
}

module.exports.raw = true

const generateLoaders = (loaders, url) => {
  let result = '!!'
  loaders.forEach(loader => {
    if (typeof loader === 'string') {
      result += `${loader}!`
    } else {
      result += `${loader.path}${loader.options ? '?' + JSON.stringify(loader.options) : ''}!`
    }
  })
  return `${result}${url}`
}
