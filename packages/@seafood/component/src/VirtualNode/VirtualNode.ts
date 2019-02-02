import { Scope } from '@seafood/reactivity'
import { VirtualElement } from './VirtualElement'

export interface VirtualNodePosition {
    primary: number
    secondary?: number
}

export abstract class VirtualNode {
    protected parentVirtualElement?: VirtualElement

    private node: Node | null = null
    private scope: Scope = new Scope()

    private anchorNode = document.createTextNode('')
    private position: VirtualNodePosition

    protected constructor(position: number = 0) {
        this.position = {
            primary: position
        }
    }

    public render() {
        this.beforeRender()
        this.renderNode()
        this.afterRender()
    }

    public getNode(): Node | null {
        return this.node
    }

    public setParentVirtualElement(virtualElement: VirtualElement) {
        this.parentVirtualElement = virtualElement
    }

    public shouldRenderChildVirtualNodes(): boolean {
        return false
    }

    public getScope(): Scope {
        return this.scope
    }

    public getAnchorNode(): Text {
        return this.anchorNode
    }

    public attach(nextSiblingNode?: Node | null) {
        if (this.node && this.parentVirtualElement) {
            if (!nextSiblingNode) {
                nextSiblingNode = this.parentVirtualElement.getNextSiblingNode(
                    this.position
                )
            }

            if (nextSiblingNode && nextSiblingNode.parentNode) {
                nextSiblingNode.parentNode.insertBefore(
                    this.node, nextSiblingNode
                )
                this.afterRender()
            }
        }
    }

    public detach() {
        if (this.node && this.node.parentNode) {
            this.node.parentNode.removeChild(this.node)
        }
    }

    public delete() {
        this.detach()

        if (this.parentVirtualElement) {
            this.parentVirtualElement.removeChildVirtualNode(this)
        }
    }

    public setPrimaryPosition(position: number) {
        this.position.primary = position
    }

    public setSecondaryPosition(position: number) {
        this.position.secondary = position
    }

    protected beforeRender() {
        this.attachAnchorNode()
        this.bindNode()
    }

    protected renderNode() {
        if (this.parentVirtualElement) {
            const node = this.getNode()
            const parentNode = this.parentVirtualElement.getNode()

            if (node && parentNode) {
                parentNode.appendChild(node)
            }
        }
    }

    protected afterRender() {
        // empty by default
    }

    protected makeNode(): Node | null | void {
        // empty by default
    }

    private bindNode() {
        const node = this.makeNode()

        if (node) {
            this.node = node
        }
    }

    private attachAnchorNode() {
        if (this.parentVirtualElement) {
            const parentNode = this.parentVirtualElement.getNode()

            if (parentNode) {
                parentNode.appendChild(this.anchorNode)
            }
        }
    }
}
