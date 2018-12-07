const Node = require('./Node')

module.exports = class TextNode extends Node {
  constructor(text) {
    super()

    this.text = text
  }

  render(context) {
    const textNode = document.createTextNode(this.text)
    context.appendChild(textNode)
  }
}
