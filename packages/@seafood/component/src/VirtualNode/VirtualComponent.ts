import { Component } from '../Component'
import { ComponentAttributes } from '../interfaces'
import { VirtualElement } from './VirtualElement'

export class VirtualComponent extends VirtualElement {
    private component: Component

    constructor(component: Component, attributes?: ComponentAttributes) {
        super()
        this.component = component
        this.attributes = attributes
    }

    public shouldRenderChildVirtualNodes(): boolean {
        // children of a component is an embedded content
        // so it's not should be rendered here
        return false
    }
}
