import { ParsedData } from '../../Parser/ParsedData'
import { VirtualRenderableInterface } from './Interfaces/VirtualRenderableInterface'
import { VirtualNode } from './VirtualNode'

export class VirtualTree extends VirtualNode implements VirtualRenderableInterface {
    constructor() {
        super({} as ParsedData)
    }

    public render(parentElement: Element): void {
        const node = this.makeNode()

        this.virtualNodes.forEach((virtualNode: VirtualNode) => {
            node.appendChild(virtualNode.getNode())
        })

        parentElement.appendChild(node)
    }

    public makeNode(): Node {
        return document.createDocumentFragment()
    }
}
