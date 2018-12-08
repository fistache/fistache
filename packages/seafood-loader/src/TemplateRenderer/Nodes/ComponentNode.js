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
    this.context.innerHTML = ''
    for(const node of this.nodes) {
      node.render(this.context)
    }
  }

  equals (node) {
    return JSON.stringify(this.nodes) === JSON.stringify(node.nodes)
  }

  clone (node) {
    this.nodes = node.nodes
  }
}
