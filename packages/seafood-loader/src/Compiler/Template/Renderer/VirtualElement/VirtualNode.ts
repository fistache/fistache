import { ParsedData } from '../../Parser/ParsedData'

export interface VirtualNodePosition {
    primary: number
    secondary?: number
}

export abstract class VirtualNode {
    protected virtualNodes: Set<VirtualNode>

    protected parsedData: ParsedData

    protected node?: Node | null

    protected parentVirtualNode: VirtualNode

    protected position: VirtualNodePosition

    constructor(parsedData: ParsedData, primaryPosition: number, parentVirtualNode: VirtualNode) {
        this.parentVirtualNode = parentVirtualNode
        this.virtualNodes = new Set()
        this.parsedData = parsedData
        this.position = { primary: primaryPosition }

        this.bindNode()
    }

    public render() {
        const parentNode = this.parentVirtualNode.getNode()
        const node = this.node as Node

        parentNode.appendChild(node)
    }

    public storeVirtualNode(virtualNode: VirtualNode) {
        this.virtualNodes.add(virtualNode)
    }

    public getChildVirtualNodes(): Set<VirtualNode> {
        return this.virtualNodes
    }

    public getChildVirtualNodesAsArray(): VirtualNode[] {
        return Array.from(this.getChildVirtualNodes())
    }

    public shouldRenderChildVirtualNodes(): boolean {
        return true
    }

    public getNode(): Node {
        return this.node as Node
    }

    public setParentVirtualNode(virtualNode: VirtualNode) {
        this.parentVirtualNode = virtualNode
    }

    public setChildVirtualNodes(virtualNodes: Set<VirtualNode>) {
        this.virtualNodes = virtualNodes
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
        const virtualNode = new this.constructor(this.parsedData, this.parsedData.position, this.parentVirtualNode)

        for (const childVirtualNode of this.getChildVirtualNodesAsArray()) {
            const clonedVirtualNode = childVirtualNode.clone()
            virtualNode.storeVirtualNode(clonedVirtualNode)
            clonedVirtualNode.setParentVirtualNode(virtualNode)
        }

        return virtualNode
    }

    protected abstract makeNode(): Node | void

    protected bindNode() {
        this.node = this.makeNode() as Node
    }
}
