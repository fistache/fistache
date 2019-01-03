import { VirtualNode } from './VirtualNode'

export class VirtualTextNode extends VirtualNode {
    public makeNode(): Node {
        return document.createTextNode(this.parsedData.data)
    }
}
