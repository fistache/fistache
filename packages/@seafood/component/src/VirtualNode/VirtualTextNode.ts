import { VirtualNode } from './VirtualNode'

export class VirtualTextNode extends VirtualNode {
    private readonly expression: string

    constructor(expression: string) {
        super()
        this.expression = expression
    }

    protected makeNode(): Node | void | null {
        // todo: resolve expression
        return document.createTextNode(this.expression)
    }
}
