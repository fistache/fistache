import { ComponentAttributes } from '@fistache/shared'
import { Component } from '../Component'
import { VIRTUAL_ELEMENT_SYMBOL, VirtualElement } from './VirtualElement'
import { VirtualNode } from './VirtualNode'

export const VIRTUAL_COMPONENT_SYMBOL = Symbol('VIRTUAL_COMPONENT_SYMBOL')

export class VirtualComponent extends VirtualElement {
    public [VIRTUAL_COMPONENT_SYMBOL] = true

    private readonly component: Component

    constructor(
        component: Component,
        attributes?: ComponentAttributes
    ) {
        super()
        this.component = component
        this.attributes = attributes
    }

    public shouldRenderChildVirtualNodes(): boolean {
        // children of a component is an embedded content
        // so it's not should be rendered here
        return false
    }

    public clone(): VirtualNode {
        return super.clone(new VirtualComponent(
            this.component.clone(),
            this.attributes
        ))
    }

    public getComponent(): Component {
        return this.component
    }

    protected beforeRender() {
        super.beforeRender()
        if (this.childVirtualNodes) {
            this.bindChildrenContext(this.childVirtualNodes)
        }
    }

    protected makeNode(): Element | null | void {
        if (this.shouldRender() && this.parentVirtualElement) {
            const node = this.parentVirtualElement.getNode()

            if (node) {
                return this.component.render(
                    node as Element, this.childVirtualNodes.slice()
                ) as Element | null
            }
        }
    }

    // todo: refactor context binding
    private bindChildrenContext(children: VirtualNode[]) {
        for (const child of children) {
            child.getScope().setContext(this.getScope().getContext())

            if ((child as VirtualElement)[VIRTUAL_ELEMENT_SYMBOL]) {
                this.bindChildrenContext(
                    (child as VirtualElement).getChildVirtualNodes()
                )
            }
        }
    }
}
