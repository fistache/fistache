import { Component } from '../Component'
import { ComponentAttributes } from '../interfaces'
import { VirtualElement } from './VirtualElement'
import { VirtualNode } from './VirtualNode'

export class VirtualComponent extends VirtualElement {
    private component: Component
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
}
