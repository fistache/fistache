import { ParsedData } from '../../Parser/ParsedData'

export interface VirtualNodePosition {
    primary: number
    secondary?: number
}

export abstract class VirtualNode {
    protected virtualNodes: Set<VirtualNode>

    protected parsedData: ParsedData

    protected node?: Node | null

    protected parentVirtualNode?: VirtualNode

    protected position: VirtualNodePosition

    constructor(parsedData: ParsedData, primaryPosition: number) {
        this.virtualNodes = new Set()
        this.parsedData = parsedData
        this.position = {
            primary: primaryPosition
        }
    }

    public storeVirtualNode(virtualNode: VirtualNode) {
        this.virtualNodes.add(virtualNode)
        virtualNode.setParentVirtualNode(virtualNode)
    }

    public getNode(): Node {
        if (!this.node) {
            this.node = this.makeNode()
        }

        return this.node
    }

    public setParentVirtualNode(virtualNode: VirtualNode) {
        this.parentVirtualNode = virtualNode
    }

    public setSecondaryPosition(position: number) {
        this.position.secondary = position
    }

    public delete() {
        if (this.node && this.node.parentNode) {
            this.node.parentNode.removeChild(this.node)
        }

        if (this.parentVirtualNode) {
            this.parentVirtualNode.deleteVirtualNode(this)
        }
    }

    public deleteVirtualNode(virtualNode: VirtualNode) {
        this.virtualNodes.delete(virtualNode)
    }

    public clone(): VirtualNode {
        // @ts-ignore
        const node = new this.constructor(this.parsedData, this.position.primary)
        node.setParentVirtualNode(this.parentVirtualNode)

        this.virtualNodes.forEach((virtualNode: VirtualNode) => {
            const clonedVirtualNode = virtualNode.clone()

            clonedVirtualNode.setParentVirtualNode(node)
            node.storeVirtualNode(clonedVirtualNode)
        })

        return node
    }

    protected abstract makeNode(): Node
}
