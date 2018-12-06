const TemplateNode = require('../TemplateNode')

module.exports = class TextTemplateNode extends TemplateNode {
  constructor(text) {
    super()

    this.text = text
  }

  render(context) {
    context.createTextNode(this.text)
  }
}
