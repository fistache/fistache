const Node = require('./Node')

module.exports = class ComponentNode extends Node {
  constructor(context) {
    super()
    this.context = context
    this.nodes = []
  }

  attach(node) {
    this.nodes.push(node)
  }

  render() {
    for(const node of this.nodes) {
      node.render(this.context)
    }
  }
}
