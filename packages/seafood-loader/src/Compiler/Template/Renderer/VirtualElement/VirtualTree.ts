import { ParsedData } from '../../Parser/ParsedData'
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

    public append(parentElement: Element): void {
        parentElement.appendChild(this.node as Node)
    }

    public makeNode(): Node {
        return document.createDocumentFragment()
    }
}
