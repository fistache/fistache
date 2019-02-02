import { ComponentAttributes } from '@seafood/shared'
import { AttributeContainer } from '../Attribute/AttributeContainer'
import { VirtualNode } from './VirtualNode'

export enum VirtualElementPresentState {
    Present,
    Missing
}

export class VirtualElement extends VirtualNode {
    protected attributes?: ComponentAttributes
    protected attributesContainer: AttributeContainer

    protected readonly childVirtualNodes: VirtualNode[] = []

    private presentState = VirtualElementPresentState.Present
    private readonly tagName?: string

    private shouldListenToElse = false
    private hasBeenIfAttributeValueChanged = false

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

    public updateIfAttributeValue(expressionValue: any) {
        const presentState = expressionValue
            ? VirtualElementPresentState.Present
            : VirtualElementPresentState.Missing

        this.hasBeenIfAttributeValueChanged
            = presentState !== this.getPresentState()
        this.setPresentState(presentState)

        if (this.hasBeenIfAttributeValueChanged) {
            this.update()
            this.updateNextVirtualNodesIfShouldListenToElse()
        }
    }

    public update() {
        if (this.getNode()) {
            this.isPresent()
                ? this.attach()
                : this.detach()
        }
    }

    public updateNextVirtualNodesIfShouldListenToElse() {
        // todo: implement

        // let nextVirtualNode = this.nextVirtualNode
        // while (nextVirtualNode
        //     && nextVirtualNode instanceof VirtualElement
        //     && nextVirtualNode.getShouldListenToElse()
        //     ) {
        //     nextVirtualNode.update()
        //     nextVirtualNode = nextVirtualNode.nextVirtualNode
        // }
    }

    public enableListeningToElse() {
        this.shouldListenToElse = true
    }

    public getShouldListenToElse(): boolean {
        return this.shouldListenToElse
    }

    public setPresentState(presentState: VirtualElementPresentState): void {
        this.presentState = presentState
    }

    public getPresentState(): VirtualElementPresentState {
        return this.presentState
    }

    public removeChildVirtualNode(virtualNode: VirtualNode) {
        const index = this.childVirtualNodes.indexOf(virtualNode)

        if (index !== -1) {
            this.childVirtualNodes.splice(index, 1)
        }
    }

    public getNextVirtualNode(virtualNode: VirtualNode): VirtualNode | null {
        const children = this.childVirtualNodes
        const currentIndex = children.indexOf(virtualNode)

        if (children.hasOwnProperty(currentIndex + 1)) {
            return children[currentIndex + 1]
        }

        return null
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

    protected isPresent(): boolean {
        if (this.getPresentState() === VirtualElementPresentState.Missing) {
            return false
        }

        if (this.shouldListenToElse) {
            return !this.checkIfPrevNodesHasElseAndShouldRender()
        }

        return true
    }

    protected checkIfPrevNodesHasElseAndShouldRender(): boolean {
        // let prevVirtualNode = this.prevVirtualNode
        let result = false
        // let distance = false
        //
        // while (prevVirtualNode && prevVirtualNode instanceof
        // VirtualElement) {
        //     if (!prevVirtualNode.getShouldListenToElse()) {
        //         if (distance) {
        //             break
        //         } else {
        //             distance = true
        //         }
        //     }
        //
        //     if (prevVirtualNode.isPresent()) {
        //         result = true
        //     }
        //
        //     prevVirtualNode = prevVirtualNode.prevVirtualNode
        // }

        return result
    }
}
