const TextTemplateNode = require('./Types/TextTemplateNode')
const TemplateNode = require('./TemplateNode')

module.exports = class TemplateRenderer {
  constructor(template) {
    this.content = this.generateContent(template)
  }

  generateContent(template) {
    let content = []

    for (const element of template) {
      let node = null

      switch (element.type) {
        case ('text'):
          node = new TextTemplateNode(element.data)
          break;
      }

      if (node) {
        content.push(node)
      }
    }

    return content
  }

  get render() {
    return (context, content) => {
      for(const node of content) {
        if (node instanceof TemplateNode) {
          node.render(context)
        } else if (Array.isArray(node)) {
          // todo: implement
        }
      }
    }
  }
}
