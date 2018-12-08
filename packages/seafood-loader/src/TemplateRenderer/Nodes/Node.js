module.exports = class Node {
  constructor() {
    this.parentNode = null
  }

  setParentNode (parentNode) {
    this.parentNode = parentNode
  }

  render (context) {
    throw new Error('This method must be implemented.')
  }
}
