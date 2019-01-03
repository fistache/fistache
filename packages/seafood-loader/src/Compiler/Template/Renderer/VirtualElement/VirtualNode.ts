import { ParsedData } from '../../Parser/ParsedData'
import { VirtualObject } from './VirtualObject'

export abstract class VirtualNode extends VirtualObject {
    protected parsedData: ParsedData

    private node?: Node | null

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

    public delete() {
        if (this.node && this.node.parentNode) {
            this.node.parentNode.removeChild(this.node)
        }

        this.deleteVirtualNodes()
        this.node = null
    }

    protected abstract makeNode(): Node
}
