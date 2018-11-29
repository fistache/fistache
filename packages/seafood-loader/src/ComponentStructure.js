const DataProcessor = require('./DataProcessor')

module.exports = class ComponentStructure {
  constructor (domTree) {
    this.domTree = domTree

    this.renderFunction = null

    this.script = null
    this.template = null
    this.style = null

    this.processDomTree()
  }

  processDomTree () {
    const scriptTag = this.findRootTag('script')
    if (scriptTag) {
      this.script = this.getTagData(scriptTag).trim()
    }

    const styleTag = this.findRootTag('style')
    if (styleTag) {
      this.style = this.getTagData(styleTag).trim()
    }

    const templateTag = this.findRootTag('template')
    if (templateTag) {
      this.template = templateTag.children
    }
  }

  findRootTag (name) {
    return this.domTree.find(tag => tag.name === name)
  }

  getTagData (tag) {
    let data = ''

    if (tag.children && tag.children.length) {
      data = tag.children[0].data
    }

    return data
  }

  getRenderFunction () {
    return this.renderFunction
  }

  getRenderFunctionAsString () {
    return DataProcessor.stringify(this.getRenderFunction())
  }

  getScriptContent () {
    // todo: rewrite import with stringifyRequest !!!
    return this.script
  }
}
