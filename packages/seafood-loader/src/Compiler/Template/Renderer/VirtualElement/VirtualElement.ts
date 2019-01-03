import { VirtualNode } from './VirtualNode'

export class VirtualElement extends VirtualNode {
    public makeNode(): Element {
        const node = document.createElement(this.parsedData.name)

        this.virtualNodes.forEach((virtualNode: VirtualNode) => {
            node.appendChild(virtualNode.getNode())
        })

        return node
    }
}
