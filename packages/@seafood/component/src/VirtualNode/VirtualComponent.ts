import { ComponentAttributes } from '@seafood/shared'
import { Component } from '../Component'
import { ElementSymbol, VirtualElement } from './VirtualElement'
import { VirtualNode } from './VirtualNode'

export class VirtualComponent extends VirtualElement {
    private readonly component: Component
    private readonly embeddedContent?: VirtualNode[]

    constructor(
        component: Component,
        attributes?: ComponentAttributes,
        embeddedContent?: VirtualNode[]
    ) {
        super()
        this.component = component
        this.attributes = attributes
        this.embeddedContent = embeddedContent
    }

    public shouldRenderChildVirtualNodes(): boolean {
        // children of a component is an embedded content
        // so it's not should be rendered here
        return false
    }

    public clone(): VirtualNode {
        return super.clone(new VirtualComponent(
            this.component,
            this.attributes,
            this.embeddedContent
        ))
    }

    protected beforeRender() {
        super.beforeRender()
        if (this.embeddedContent) {
            this.bindChildrenContext(this.embeddedContent)
        }
    }

    protected makeNode(): Element | void {
        if (this.shouldRender() && this.parentVirtualElement) {
            const node = this.parentVirtualElement.getNode()

            if (node) {
                return this.component.render(
                    node as Element, this.embeddedContent
                )
            }
        }
    }

    // todo: refactor context binding
    private bindChildrenContext(children: VirtualNode[]) {
        for (const child of children) {
            child.getScope().setContext(this.getScope().getContext())

            if ((child as VirtualElement)[ElementSymbol]) {
                this.bindChildrenContext(
                    (child as VirtualElement).getChildVirtualNodes()
                )
            }
        }
    }
}
