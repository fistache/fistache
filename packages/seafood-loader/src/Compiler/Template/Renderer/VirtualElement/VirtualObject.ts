import { VirtualNode } from './VirtualNode'

export abstract class VirtualObject {
    protected virtualNodes: Set<VirtualNode>

    constructor() {
        this.virtualNodes = new Set()
    }

    public storeVirtualNode(virtualNode: VirtualNode) {
        this.virtualNodes.add(virtualNode)
    }

    protected deleteVirtualNodes() {
        this.virtualNodes.forEach((virtualNode: VirtualNode) => {
            virtualNode.delete()
        })
        this.virtualNodes.clear()
    }
}
