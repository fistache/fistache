const {Parser, DomHandler} = require('htmlparser2')
const ComponentStructure = require('./ComponentStructure')

module.exports = class Compiler {
  constructor () {
    this.callback = null
    this.parser = new Parser(this.getParserHandler(), this.getParserOptions())
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

  finishParsing(domTree) {
    try {
      const structure = new ComponentStructure(domTree)
      this.callback(null, structure)
    } catch (exception) {
      this.callback(exception.message)
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
