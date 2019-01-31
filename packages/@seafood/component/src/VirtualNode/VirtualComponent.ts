import { AttributeContainer } from '../Attribute/AttributeContainer'
import { Component } from '../Component'
import { ComponentAttributes } from '../interfaces'
import { VirtualElement } from './VirtualElement'

export class VirtualComponent extends VirtualElement {
    private component: Component

    constructor(component: Component, attributes?: ComponentAttributes) {
        super()
        this.component = component
        this.attributes = attributes

        if (this.shouldRenderAttributes()) {
            this.attributesContainer = new AttributeContainer(this)
        }
    }
}
