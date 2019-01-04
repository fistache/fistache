import { ParsedData } from '../../Parser/ParsedData'
import { VirtualObject } from './VirtualObject'

export abstract class VirtualNode extends VirtualObject {
    protected parsedData: ParsedData

    protected node?: Node | null

    protected parentVirtualNode?: VirtualNode

    constructor(parsedData: ParsedData) {
        super()
        this.parsedData = parsedData
    }

    public getNode(): Node {
        if (!this.node) {
            this.node = this.makeNode()
        }

        return this.node
    }

    public resetNode() {
        this.node = null
    }

    public setParentVirtualNode(virtuanNode: VirtualNode) {
        this.parentVirtualNode = virtuanNode
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

    protected abstract makeNode(): Node
}
