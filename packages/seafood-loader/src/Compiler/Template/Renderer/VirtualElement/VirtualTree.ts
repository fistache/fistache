import { ParsedData } from '../../Parser/ParsedData'
import { VirtualNode } from './VirtualNode'

export class VirtualTree extends VirtualNode {
    constructor() {
        super({} as ParsedData, 0)
    }

    public append(parentElement: Element): void {
        parentElement.appendChild(this.node as Node)
    }

    public makeNode(): Node {
        return document.createDocumentFragment()
    }
}
