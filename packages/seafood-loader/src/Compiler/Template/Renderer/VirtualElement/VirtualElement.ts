import { VirtualNode } from './VirtualNode'

export class VirtualElement extends VirtualNode {
    public makeNode(): Element {
        return document.createElement(this.parsedData.name)
    }
}
