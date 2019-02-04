import { Component } from '../Component'
import { VirtualElement } from './VirtualElement'
import { VirtualNode } from './VirtualNode'

export class VirtualEmbeddedContent extends VirtualElement {
    private readonly embeddedContent?: VirtualNode[] | null

    constructor(embeddedContent?: VirtualNode[] | null) {
        super()
        this.embeddedContent = embeddedContent
    }

    protected makeNode(): Element | void {
        if (this.parentVirtualElement && this.embeddedContent) {
            this.resetEmbeddedContentParentVirtualElement()

            return Component.renderFragment(this.embeddedContent)
        }
    }

    private resetEmbeddedContentParentVirtualElement() {
        if (this.parentVirtualElement && this.embeddedContent) {
            for (const virtualNode of this.embeddedContent) {
                virtualNode.setParentVirtualElement(this.parentVirtualElement)
                virtualNode.setPrimaryPosition(this.getPosition().primary)
            }
        }
    }
}
