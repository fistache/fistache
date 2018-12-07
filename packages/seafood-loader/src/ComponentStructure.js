module.exports = class ComponentStructure {
  constructor (context, domTree) {
    this.domTree = domTree

    this.script = null
    this.renderContent = null
    this.template = null
    this.style = null

    this.loaderContext = context

    this.processDomTree()
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
      this.renderContent = this.generateContent(this.template)
    }
  }

  generateContent (domTree) {
    let content = []

    for (const elementIndex in domTree) {
      const element = domTree[elementIndex]
      content.push({
        type: element.type,
        name: element.name,
        attribs: element.attribs,
        data: element.data,
        children: this.generateContent(element.children),
      })
    }

    return content
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

  getRenderContentAsString () {
    return JSON.stringify(this.renderContent)
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
