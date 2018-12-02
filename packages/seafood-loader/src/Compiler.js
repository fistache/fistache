const {Parser, DomHandler} = require('htmlparser2')
const ComponentStructure = require('./ComponentStructure')
const {makeExportString} = require('../lib/export')

class Compiler {
  constructor () {
    this.callback = null
    this.parser = new Parser(this.getParserHandler(), this.getParserOptions())
    this.loaderContext = null
  }

  setCallback (callback) {
    this.callback = callback
    return this
  }

  compile (source) {
    if (typeof source === 'string') {
      this.parse(source.trim())
    } else {
      this.callback('Source is not a string')
    }
  }

  setLoaderContext (context) {
    this.loaderContext = context
    return this
  }

  finishParsing(domTree) {
    try {
      const structure = new ComponentStructure(this.loaderContext, domTree)

      const script = makeExportString([
        structure.getScriptContent(),
        ``,
        `export const __$render__ = ${(() => {
        }).toString()}`,
        ``
      ])

      this.callback(null, {
        script
      })
    } catch (exception) {
      this.callback(exception)
    }
  }

  parse (source) {
    this.parser.write(source)
    this.parser.end()
  }

  getParserHandler () {
    return new DomHandler((error, domTree) => {
      if (error) {
        this.callback(error)
      } else {
        this.finishParsing(domTree)
      }
    });
  }

  getParserOptions () {
    return {
      recognizeSelfClosing: true
    }
  }
}

module.exports = () => new Compiler()
