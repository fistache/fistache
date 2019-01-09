import { ParsedData } from '../../Parser/ParsedData'
import { Scope } from '../Reactivity/Scope'

export interface VirtualNodePosition {
    primary: number
    secondary?: number
}

export abstract class VirtualNode {
    protected childVirtualNodes: Set<VirtualNode>

    protected parentVirtualNode: VirtualNode

    protected parsedData: ParsedData

    protected node?: Node | null

    protected position: VirtualNodePosition

    protected scope: Scope

    constructor(parsedData: ParsedData, primaryPosition: number, parentVirtualNode: VirtualNode) {
        this.parentVirtualNode = parentVirtualNode
        this.childVirtualNodes = new Set()
        this.parsedData = parsedData
        this.position = { primary: primaryPosition }
        this.scope = new Scope()
    }

    public beforeRender() {
        this.bindNode()
    }

    public render() {
        const parentNode = this.parentVirtualNode.getNode()
        const node = this.node as Node

        parentNode.appendChild(node)
    }

    public shouldRenderChildVirtualNodes(): boolean {
        return true
    }

    public getNode(): Node {
        return this.node as Node
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
        this.childVirtualNodes.delete(virtualNode)
    }

    public clone(): VirtualNode {
        const virtualNode = new (this.constructor as any)(
            this.parsedData,
            this.position.primary,
            this.parentVirtualNode
        )

        for (const childVirtualNode of this.getChildVirtualNodesAsArray()) {
            const clonedVirtualNode = childVirtualNode.clone()
            virtualNode.addChildVirtualNode(clonedVirtualNode)
            clonedVirtualNode.setParentVirtualNode(virtualNode)
        }

        return virtualNode
    }

    public addChildVirtualNode(virtualNode: VirtualNode) {
        this.childVirtualNodes.add(virtualNode)
    }

    public getChildVirtualNodes(): Set<VirtualNode> {
        return this.childVirtualNodes
    }

    public getChildVirtualNodesAsArray(): VirtualNode[] {
        return Array.from(this.getChildVirtualNodes())
    }

    public getScope(): Scope {
        return this.scope
    }

    public setParentVirtualNode(virtualNode: VirtualNode) {
        this.parentVirtualNode = virtualNode
    }

    public setChildVirtualNodes(virtualNodes: Set<VirtualNode>) {
        this.childVirtualNodes = virtualNodes
    }

    public setSecondaryPosition(position: number) {
        this.position.secondary = position
    }

    protected abstract makeNode(): Node | void

    protected bindNode() {
        this.node = this.makeNode() as Node
    }
}
