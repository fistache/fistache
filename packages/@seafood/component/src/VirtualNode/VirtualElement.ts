import { AttributeContainer } from '../Attribute/AttributeContainer'
import { AttributeKeyword, ComponentAttributes } from '../interfaces'
import { VirtualNode } from './VirtualNode'

export enum VirtualElementPresentState {
    Present,
    Missing
}

export class VirtualElement extends VirtualNode {
    protected attributes?: ComponentAttributes
    protected attributesContainer?: AttributeContainer

    protected readonly childVirtualNodes: VirtualNode[] = []

    protected presentState = VirtualElementPresentState.Present
    private readonly tagName?: string

    constructor(tagName?: string, attributes?: ComponentAttributes) {
        super()
        this.tagName = tagName
        this.attributes = attributes

        if (this.shouldRenderAttributes()) {
            this.attributesContainer = new AttributeContainer(this)
        }
    }

    public addChildVirtualNode(virtualNode: VirtualNode) {
        this.childVirtualNodes.push(virtualNode)
    }

    protected beforeRender() {
        if (this.shouldRenderAttributes()) {
            this.attributesContainer!.renderSpecialAttributes()
        }

        if (this.shouldRender()) {
            super.beforeRender()
        }
    }

    protected makeNode(): Element | void {
        if (this.tagName) {
            return document.createElement(this.tagName)
        }
    }

    protected shouldRender(): boolean {
        return this.presentState === VirtualElementPresentState.Present
    }

    protected shouldRenderAttributes(): boolean {
        if (!this.attributes) {
            return false
        }

        return AttributeKeyword.Special in this.attributes
            || AttributeKeyword.Static in this.attributes
            || AttributeKeyword.Dynamic in this.attributes
            || AttributeKeyword.Injection in this.attributes
    }
}
