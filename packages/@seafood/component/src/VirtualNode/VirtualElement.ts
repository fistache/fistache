import { AttributeContainer } from '../Attribute/AttributeContainer'
import { ComponentAttributes } from '../interfaces'
import { VirtualNode } from './VirtualNode'

export enum VirtualElementPresentState {
    Present,
    Missing
}

export class VirtualElement extends VirtualNode {
    protected attributes?: ComponentAttributes
    protected attributesContainer: AttributeContainer

    protected readonly childVirtualNodes: VirtualNode[] = []

    protected presentState = VirtualElementPresentState.Present
    private readonly tagName?: string

    constructor(tagName?: string, attributes?: ComponentAttributes) {
        super()
        this.tagName = tagName
        this.attributes = attributes
        this.attributesContainer = new AttributeContainer(this)
    }

    public addChildVirtualNode(virtualNode: VirtualNode) {
        this.childVirtualNodes.push(virtualNode)
    }

    public getChildVirtualNodes(): VirtualNode[] {
        return this.childVirtualNodes
    }

    public shouldRenderChildVirtualNodes(): boolean {
        return true
    }

    protected beforeRender() {
        this.attributesContainer.initialize(this.attributes)

        if (this.shouldRenderAttributes()) {
            this.attributesContainer.renderSpecialAttributes()
        }

        if (this.shouldRender()) {
            super.beforeRender()
        }
    }

    protected afterRender() {
        if (this.shouldRender()) {
            super.afterRender()

            if (this.shouldRenderAttributes()) {
                this.attributesContainer.renderStaticAttributes()
                this.attributesContainer.renderDynamicAttributes()
                this.attributesContainer.renderEventAttributes()
            }
        }
    }

    protected makeNode(): Element | void {
        if (this.tagName && this.shouldRender()) {
            return document.createElement(this.tagName)
        }
    }

    protected shouldRender(): boolean {
        return this.presentState === VirtualElementPresentState.Present
    }

    protected shouldRenderAttributes(): boolean {
        return !!this.attributes
    }
}
