import { Scope } from '@fistache/reactivity'
import { VirtualElement } from './VirtualElement'

export interface VirtualNodePosition {
    primary: number
    secondary?: number | null
}

export abstract class VirtualNode {
    protected parentVirtualElement?: VirtualElement
    protected anchorNode: Text | null = null

    protected wasRendered = false

    private node: Node | null = null
    private scope: Scope = new Scope()

    private readonly position: VirtualNodePosition = {
        primary: 0,
        secondary: null
    }

    public render(attachBefore?: Node | null) {
        this.beforeRender()
        attachBefore
            ? this.attach(attachBefore)
            : this.renderNode()
        this.afterRender()
    }

    public getNode(): Node | null {
        return this.node
    }

    public setParentVirtualElement(virtualElement: VirtualElement) {
        this.parentVirtualElement = virtualElement
    }

    public getParentVirtualElement(): VirtualElement | undefined {
        return this.parentVirtualElement
    }

    public shouldRenderChildVirtualNodes(): boolean {
        return false
    }

    public getScope(): Scope {
        return this.scope
    }

    public getAnchorNode(): Text | null {
        return this.anchorNode
    }

    public getPosition(): VirtualNodePosition {
        return this.position
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

        this.getScope().removeParentScope()
        // todo: remove depended function in reactive property
        // todo: for virtual element remove event listeners and etc

        if (this.parentVirtualElement) {
            this.parentVirtualElement.removeChildVirtualNode(this)
            this.parentVirtualElement = undefined
        }
    }

    public setPosition(position: VirtualNodePosition) {
        this.position.primary = position.primary
        this.position.secondary = position.secondary
    }

    public setPrimaryPosition(position: number) {
        this.position.primary = position
    }

    public setSecondaryPosition(position: number) {
        this.position.secondary = position
    }

    public clone(virtualNode?: VirtualNode): VirtualNode {
        const parentScope = this.getScope().getParentScope()
        if (!virtualNode) {
            virtualNode = new (this.constructor as any)(
                this.position.primary
            ) as VirtualNode
        }

        virtualNode.setPosition(this.getPosition())
        virtualNode.getScope().setContext(this.getScope().getContext())

        if (parentScope) {
            virtualNode.getScope().setParentScope(parentScope)
        }

        return virtualNode
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

    protected bindNode() {
        const node = this.makeNode()

        if (node) {
            this.node = node
            this.wasRendered = true
        }
    }

    protected attachAnchorNode() {
        this.anchorNode = document.createTextNode('')
        if (this.parentVirtualElement) {
            const parentNode = this.parentVirtualElement.getNode()

            if (parentNode) {
                parentNode.appendChild(this.anchorNode)
            }
        }
    }
}
