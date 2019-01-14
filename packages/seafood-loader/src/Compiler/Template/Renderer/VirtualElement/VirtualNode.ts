import { ParsedData } from '../../Parser/ParsedData'
import { Scope } from '../Reactivity/Scope'

export interface VirtualNodePosition {
    primary: number
    secondary?: number
}

export abstract class VirtualNode {
    protected childVirtualNodes: VirtualNode[]

    protected parentVirtualNode: VirtualNode

    protected parsedData: ParsedData

    protected node?: Node | null

    protected position: VirtualNodePosition

    protected scope: Scope

    protected anchorNode: Node

    constructor(parsedData: ParsedData, primaryPosition: number, parentVirtualNode: VirtualNode) {
        this.parentVirtualNode = parentVirtualNode
        this.childVirtualNodes = []
        this.parsedData = parsedData
        this.position = { primary: primaryPosition }
        this.scope = new Scope()
        this.anchorNode = document.createTextNode('')
    }

    public beforeRender() {
        this.attachAnchorNode()
        this.bindNode()
    }

    public render() {
        const parentNode = this.parentVirtualNode.getNode()
        const node = this.node as Node

        parentNode.appendChild(node)
    }

    public afterRender() {
        //
    }

    public shouldRenderChildVirtualNodes(): boolean {
        return true
    }

    public getNode(): Node {
        return this.node as Node
    }

    public getAnchorNode(): Node {
        return this.anchorNode
    }

    public getNextSiblingNode(position: VirtualNodePosition): Node | null {
        let node = null

        for (const child of this.childVirtualNodes) {
            if (child.position.primary > position.primary) {
                node = child.getAnchorNode()
                break
            }
        }

        return node
    }

    public attach(nextSiblingNode?: Node | null) {
        if (this.parentVirtualNode) {
            if (!nextSiblingNode) {
                nextSiblingNode = this.parentVirtualNode.getNextSiblingNode(this.position)
            }

            if (nextSiblingNode && nextSiblingNode.parentNode) {
                nextSiblingNode.parentNode.insertBefore(this.getNode(), nextSiblingNode)
                this.afterRender()
            }
        }
    }

    public delete() {
        if (this.node && this.node.parentNode) {
            this.node.parentNode.removeChild(this.node)
        }

        if (this.parentVirtualNode) {
            this.parentVirtualNode.removeVirtualNode(this)
        }
    }

    public removeVirtualNode(virtualNode: VirtualNode) {
        const index = this.childVirtualNodes.indexOf(virtualNode)

        if (index !== -1) {
            this.childVirtualNodes.splice(index, 1)
        }
    }

    public clone(): VirtualNode {
        const virtualNode = new (this.constructor as any)(
            this.parsedData,
            this.position.primary,
            this.parentVirtualNode
        )

        virtualNode.getScope().setContext(this.getScope().getContext())

        for (const childVirtualNode of this.getChildVirtualNodes()) {
            const clonedVirtualNode = childVirtualNode.clone()
            virtualNode.addChildVirtualNode(clonedVirtualNode)
            clonedVirtualNode.setParentVirtualNode(virtualNode)
        }

        return virtualNode
    }

    public addChildVirtualNode(virtualNode: VirtualNode, index?: number) {
        if (index) {
            this.childVirtualNodes[index] = virtualNode
        } else {
            this.childVirtualNodes.push(virtualNode)
        }
    }

    public getChildVirtualNodes(): VirtualNode[] {
        return this.childVirtualNodes
    }

    public getScope(): Scope {
        return this.scope
    }

    public setParentVirtualNode(virtualNode: VirtualNode) {
        this.parentVirtualNode = virtualNode
    }

    public getParentVirtualNode(): VirtualNode | undefined {
        return this.parentVirtualNode
    }

    public setSecondaryPosition(position: number) {
        this.position.secondary = position
    }

    public getPosition(): VirtualNodePosition {
        return this.position
    }

    protected abstract makeNode(): Node | void

    protected bindNode() {
        this.node = this.makeNode() as Node
    }

    protected attachAnchorNode() {
        const parentNode = this.parentVirtualNode.getNode()

        if (parentNode) {
            parentNode.appendChild(this.anchorNode)
        }
    }
}
