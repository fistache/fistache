const TextNode = require('./Nodes/TextNode')
const ComponentNode = require('./Nodes/ComponentNode')

module.exports = class TemplateRenderer {
  constructor() {
    this.context = null
    this.content = []
  }

  setContext(context) {
    this.context = context
    return this
  }

  setContent(content) {
    this.content = content
    return this
  }

  generateNodesToRender(contextNode, content) {
    for (const element of content) {
      let node = null

      switch (element.type) {
        case ('text'):
          node = new TextNode(element.data)
          break;
        case ('tag'):
          // check tag name
          // if unknow -> generateNodesToRender()
          break;
      }

      if (node) {
        contextNode.attach(node)
      }
    }
  }

  render() {
    let node = new ComponentNode(this.context)
    this.generateNodesToRender(node, this.content)
    node.render()
  }
}
