const Node = require('./Node')
const TextNode = require('./TextNode')

module.exports = class TagNode extends Node {
  constructor(name/*, data*/, attribs) {
    super()
    this.name = name
    // this.data = data
    this.attribs = attribs
    this.nodes = []

    this.htmlNode = null
  }

  attach(node) {
    this.nodes.push(node)
  }

  renderAttributes() {
    for (const attribute of this.htmlNode.attributes) {
      this.htmlNode.removeAttribute(attribute.name)
    }
    for(const attrib in this.attribs) {
      this.htmlNode.setAttribute(attrib, this.attribs[attrib])
    }
  }

  render(context) {
    const virtualNode = document.createElement(this.name)
    for(const attrib in this.attribs) {
      virtualNode.setAttribute(attrib, this.attribs[attrib])
    }

    if (context) {
      context.appendChild(virtualNode)
      this.htmlNode = virtualNode
    } else if (this.htmlNode) {
      const parentNode = this.htmlNode.parentNode
      parentNode.replaceChild(virtualNode, this.htmlNode)
      this.htmlNode = virtualNode
    }

    for (const node of this.nodes) {
      node.render(this.htmlNode)
    }
  }

  equals (node) {
    return !(
      this.name !== node.name ||
      this.data !== node.data ||
      this.attribs !== node.attribs ||
      JSON.stringify(this.nodes) !== JSON.stringify(node.nodes)
    );
  }

  clone (node) {
    this.name = node.name
    this.data = node.data
    this.attribs = node.attribs
    this.nodes = node.nodes
  }
}
