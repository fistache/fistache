const utils = require('loader-utils')
const qs = require('querystring')
const parse = require('./lib/parse')
const {makeExportString} = require('./lib/export')
const path = require('path')

module.exports = async function(source, sourceMap) {
  const context = this
  const finish = this.async()
  const {resourcePath, resourceQuery} = context
  const query = utils.getOptions(context) || {}
  const rawQuery = resourceQuery.slice(1)
  const incomingQuery = qs.parse(rawQuery)

  if (incomingQuery.type) {
    if (incomingQuery.type === 'script') {
      parse(context, source, (error, component) => {
        if (error) {
          finish(error)
          return
        }

        // this.options.context = path.resolve('node_modules')
        // this.rootContext = path.resolve('node_modules')
        // this.context = path.resolve()
        // context.resourcePath += '.ts'
        // как указать контекст?
        finish(null, component.script)
      })
    }
  } else {
    const genLoaders = (loaders, src, query) => {
      return utils.stringifyRequest(this, '!!' + [
        ...loaders,
        src + query
      ].join('!'))
    }

    let importScript = null
    // if (component.script) {
      const src = resourcePath
      const query = `?seafood&type=script`
      const request = genLoaders(['babel-loader', 'ts-loader?{compilerOptions:{"moduleResolution": "node"},transpileOnly: true, allowTsInNodeModules: true, appendTsSuffixTo: [\'\\\\.seafood$\']}', 'seafood-loader'], src, query)
      importScript = makeExportString([
        `import script from ${request}`,
        `export default script`,
        `export * from ${request}`
      ])
    // }

    let code = makeExportString([
      importScript,
      ``
    ])

    finish(null, code)
  }
}
