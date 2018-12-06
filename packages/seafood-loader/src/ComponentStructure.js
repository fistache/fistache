const TemplateRenderer = require('./TemplateRenderer/TemplateRenderer')

module.exports = class ComponentStructure {
  constructor (context, domTree) {
    this.domTree = domTree

    this.script = null
    this.template = null
    this.style = null

    this.loaderContext = context

    this.processDomTree()

    this.templateRenderer = new TemplateRenderer(this.template)
  }

  processDomTree () {
    const scriptTag = this.findRootTag('script')
    if (scriptTag) {
      this.script = this.getTagData(scriptTag).trim()
      this.fixScriptImports()
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

  getRenderFunctionAsString () {
    return this.templateRenderer.render.toString()
  }

  getRenderContentAsString () {
    return JSON.stringify(this.templateRenderer.content)
  }

  getScriptContent () {
    return this.script
  }

  fixScriptImports () {
    // const regex = /import(?:["'\s]*([\w*{}\n\r\t, ]+)from\s*)["'\s].*([@\w/_-]+)["'\s].*;?$/gm
    // this.script = this.script.replace(regex, match => {
    //   return match.replace(/"([^"]+)"/s, submatch => {
    //     if (!this.loaderContext) {
    //       throw new Error('Loader context must be specified!')
    //     }
    //     let result = submatch.replace(/"/gi, '')
    //     if (!result.includes('.')) {
    //         return submatch
    //     }
    //     return loaderUtils.stringifyRequest(this.loaderContext, result)
    //   })
    // })
  }
}
