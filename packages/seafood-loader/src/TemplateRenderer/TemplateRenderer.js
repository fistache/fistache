const TextNode = require('./Nodes/TextNode')
const ComponentNode = require('./Nodes/ComponentNode')
const TagNode = require('./Nodes/TagNode')

module.exports = class TemplateRenderer {
  constructor() {
    this.context = null
    this.renderedContent = null
    this.content = []
    this.node = null
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
    content.forEach(element => {
      let node = null

      switch (element.type) {
        case ('text'):
          node = new TextNode(element.data)
          break;
        case ('tag'):
          // todo: if component.use do not contain component with similar name
          if (htmlTags.includes(element.name)) {
            node = new TagNode(element.name, element.attribs)
          }
          if (element.children && element.children.length) {
            const childNode = this.generateNodesToRender(node, element.children)
            if (childNode) {
              node.attach(childNode)
            }
          }
          break;
      }

      if (node) {
        contextNode.attach(node)
      }
    })
  }

  render() {
    if (!this.context) {
      throw new Error('Context must be specified.')
    }

    const node = new ComponentNode(this.context)
    this.generateNodesToRender(node, this.content)

    if (this.node && this.node.nodes && this.node.nodes.length === node.nodes.length) {
      this.rerenderUpdatedChunk(this.node, node)
    } else {
      node.render()
      this.node = node
    }
  }

  areAllChildNodeEquals(prevNode, currentNode) {
    const prev = this.prepareAllChildNodesToCompare(prevNode)
    const current = this.prepareAllChildNodesToCompare(currentNode)

    return JSON.stringify(prev) === JSON.stringify(current)
  }

  isTypeOfChildNodesEquals(prevNode, currentNode) {
    if (prevNode.nodes.length !== currentNode.nodes.length) {
      return false
    }

    for (let i = 0; i < prevNode.nodes.length; i++) {
      if (typeof prevNode.nodes[i] !== typeof currentNode.nodes[i]) {
        return false
      }
    }

    return true
  }

  prepareAllChildNodesToCompare(node, nested) {
    let processedNode = {
      nodes: []
    }

    if (nested) {
      processedNode.type = node.type;
      processedNode.name = node.name;
      processedNode.data = node.data;
      processedNode.attribs = node.attribs;
    }

    if (node.nodes) {
      node.nodes.forEach(childNode => {
        processedNode.nodes.push(this.prepareAllChildNodesToCompare(childNode, true))
      })
    }

    return processedNode
  }

  rerenderUpdatedChunk(prevNode, currentNode) {
    if (Array.isArray(prevNode)) {
      if (Array.isArray(currentNode) &&
        typeof prevNode === typeof currentNode &&
        prevNode.length === prevNode.length
      ) {
        for (let i = 0; i < prevNode.length; i++) {
          this.rerenderUpdatedChunk(prevNode[i], currentNode[i])
        }
      } else {
        // currentNode.render()
        // prevNode = currentNode
      }
    } else {
      if (!prevNode.equals(currentNode)) {
        if (typeof prevNode === typeof currentNode &&
          prevNode.nodes && currentNode.nodes &&
          (!(prevNode instanceof TagNode) && this.isTypeOfChildNodesEquals(prevNode, currentNode) ||
          (!this.areAllChildNodeEquals(prevNode, currentNode) && prevNode instanceof TagNode))
        ) {
          this.rerenderUpdatedChunk(prevNode.nodes, currentNode.nodes)
        } else {
          prevNode.clone(currentNode)

          if (prevNode instanceof TagNode && this.areAllChildNodeEquals(prevNode, currentNode)) {
            prevNode.renderAttributes()
          } else {
            prevNode.render()
          }
        }
      }
    }
  }
}

const htmlTags = [
  'dir', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'font', 'form', 'frame', 'frameset',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', /* 'html' ,*/ 'hype', 'i', 'iframe', 'img',
  'video', 'track', 'time', 'tfoot', 'tbody', 'summary', 'source', 'section',
  'ruby', 'rt', 'rp', 'q', 'progress', 'output', 'optgroup', 'object', 'nav',
  'meter', 'menuitem', 'mark', 'main', 'keygen', 'header', 'footer', 'figure',
  'figcaption', 'dialog', 'details', 'datalist', 'canvas', 'bdo', 'bdi', 'audio',
  'aside', 'article', 'acronym', 'abbr', 'sup', 'del', 'textarea', 'th', 'title',
  'tr', 'tt', 'u', 'ul', 'var', 'wbr', 'xmp', 'input', 'isindex', 'kbd', 'label',
  'legend', 'li', 'link', 'listing', 'map', 'marquee', 'menu', 'meta', 'multicol',
  'nobr', 'noembed', 'noframes', 'noscript', 'ol', 'option', 'p', 'param', 'plaintext',
  'pre', 's', 'samp', 'script', 'select', 'small', 'sound', 'spacer', 'span', 'strong',
  'style', 'sub', 'table', 'thead', 'td', 'a', 'address', 'app', 'applet', 'area', 'b',
  'base', 'basefont', 'bgsound', 'big', 'blink', 'blockquote', /* 'body',*/ 'br', 'button',
  'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'comment', 'dd', 'ins', 'dfn',
]
