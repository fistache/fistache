const Node = require('./Node')

module.exports = class TextNode extends Node {
  constructor(text) {
    super()

    this.text = text
    this.htmlNode = null
  }

  render(context) {
    if (!context && this.htmlNode) {
      this.htmlNode.innerHTML = ''
    }

    if (context) {
      this.htmlNode = context
    }

    const textNode = document.createTextNode(this.text)
    this.htmlNode.appendChild(textNode)
  }

  equals (node) {
    return !(
      this.text !== node.text
    );
  }

  clone (node) {
    this.text = node.text
  }
}
