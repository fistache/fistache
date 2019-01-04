import { ParsedData } from '../../Parser/ParsedData'
import { VirtualRenderableInterface } from './Interfaces/VirtualRenderableInterface'
import { VirtualNode } from './VirtualNode'

export class VirtualTree extends VirtualNode implements VirtualRenderableInterface {
    constructor() {
        super({} as ParsedData, 0)
    }

    public render(parentElement: Element): void {
        parentElement.appendChild(this.makeNode())
    }

    public makeNode(): Node {
        return Array.from(this.virtualNodes)[0].getNode()
    }
}
