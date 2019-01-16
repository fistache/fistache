import { ParsedData } from '../../../ParsedData'
import { Reactivity } from '../Reactivity/Reactivity'
import { VirtualNode } from './VirtualNode'

export class VirtualTree extends VirtualNode {
    protected reactivity?: Reactivity

    constructor() {
        super({} as ParsedData, 0, {} as VirtualNode)
    }

    public beforeRender() {
        this.bindNode()
        this.reactivity = new Reactivity(this.scope.getContext())
        this.reactivity.bindComponent()
    }

    public append(parentElement: Element, beforeChild?: Node): Node | null | undefined {
        const node = this.node && this.node.lastChild
        parentElement.insertBefore(this.node as Node, beforeChild || null)
        return node
    }

    public makeNode(): Node {
        return document.createDocumentFragment()
    }
}
