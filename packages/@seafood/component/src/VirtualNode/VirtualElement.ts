import { ComponentAttributes } from '@seafood/shared'
import { AttributeContainer } from '../Attribute/AttributeContainer'
import { Component } from '../Component'
import { VirtualNode, VirtualNodePosition } from './VirtualNode'

export enum VirtualElementPresentState {
    Present,
    Missing
}

export const ElementSymbol = Symbol('VirtualElement')

export class VirtualElement extends VirtualNode {
    public [ElementSymbol] = true

    protected attributes?: ComponentAttributes
    protected attributesContainer: AttributeContainer

    protected childVirtualNodes: VirtualNode[] = []

    private presentState = VirtualElementPresentState.Present
    private readonly tagName?: string

    private shouldListenToElse = false
    private hasBeenIfAttributeValueChanged = false

    private isItMaquetteInstance = false

    constructor(
        tagName?: string,
        attributes?: ComponentAttributes
    ) {
        super()
        this.tagName = tagName
        this.attributes = attributes
        this.attributesContainer = new AttributeContainer(this)
    }

    public addChildVirtualNode(virtualNode: VirtualNode, index?: number) {
        // todo: when attaching a virtual node add it to
        // array of children using it's position

        index
            ? this.childVirtualNodes[index] = virtualNode
            : this.childVirtualNodes.push(virtualNode)
    }

    public getChildVirtualNodes(): VirtualNode[] {
        return this.childVirtualNodes
    }

    public shouldRenderChildVirtualNodes(): boolean {
        return this.shouldRender()
    }

    public markAsMaquetteInstance() {
        this.isItMaquetteInstance = true
    }

    public getAttributeContainer(): AttributeContainer {
        return this.attributesContainer
    }

    public updateIfAttributeValue(expressionValue: any, isItUpdate = true) {
        const presentState = expressionValue
            ? VirtualElementPresentState.Present
            : VirtualElementPresentState.Missing

        this.hasBeenIfAttributeValueChanged
            = presentState !== this.getPresentState()
        this.setPresentState(presentState)

        if (isItUpdate && this.hasBeenIfAttributeValueChanged) {
            this.update()
            if (this.parentVirtualElement) {
                this.parentVirtualElement
                    .updateNextVirtualNodesIfShouldListenToElse(this)
            }
        }
    }

    public update() {
        if (this.getNode()) {
            this.shouldRender()
                ? this.attach()
                : this.detach()
        } else if (this.shouldRender()) {
            this.bindNode()

            this.renderNode()
            Component.renderFragment(this.childVirtualNodes)
        }
    }

    public updateNextVirtualNodesIfShouldListenToElse(
        virtualElement: VirtualElement
    ) {
        const maxIndex = this.childVirtualNodes.length - 1
        let index = this.childVirtualNodes.indexOf(virtualElement)

        if (index >= 0 && index < maxIndex) {
            let child
            do {
                child = this.childVirtualNodes[++index] as VirtualElement
                child.update()
            } while (index < maxIndex
                && child[ElementSymbol]
                && child.getShouldListenToElse()
            )
        }
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

    public getNextSiblingNode(position: VirtualNodePosition): Node | null {
        let node = null

        if (typeof position.secondary === 'undefined') {
            for (const child of this.childVirtualNodes) {
                if (child.getPosition().primary > position.primary) {
                    node = child.getAnchorNode()
                    break
                }
            }
        } else {
            for (const child of this.childVirtualNodes) {
                if (child.getPosition().primary === position.primary) {
                    node = child.getAnchorNode()
                } else if (!node
                    && child.getPosition().primary > position.primary
                ) {
                    node = child.getAnchorNode()
                    break
                } else if (child.getPosition().primary > position.primary) {
                    break
                }
            }
        }

        if (!node && this.childVirtualNodes.length) {
            node = this.childVirtualNodes[0].getAnchorNode()
        }

        return node
    }

    public shouldRender(): boolean {
        if (this.getPresentState() === VirtualElementPresentState.Missing) {
            return false
        }

        if (this.shouldListenToElse && this.parentVirtualElement) {
            return !this.parentVirtualElement
                .checkIfPrevNodesHasElseAndShouldRender(this)
        }

        return true
    }

    public clone(virtualElement?: VirtualElement): VirtualNode {
        const parentScope = this.getScope().getParentScope()
        if (!virtualElement) {
            virtualElement = new (this.constructor as any)(
                this.tagName,
                this.attributes
            ) as VirtualElement
        }

        virtualElement.setPosition(this.getPosition())
        virtualElement.getScope().setContext(this.getScope().getContext())

        if (parentScope) {
            virtualElement.getScope().setParentScope(parentScope)
        }

        for (const childVirtualNode of this.getChildVirtualNodes()) {
            const clonedVirtualNode = childVirtualNode.clone()
            virtualElement.addChildVirtualNode(clonedVirtualNode)
            clonedVirtualNode.setParentVirtualElement(virtualElement)
            clonedVirtualNode.getScope().setParentScope(
                virtualElement.getScope()
            )
        }

        return virtualElement
    }

    protected beforeRender() {
        if (!this.isItMaquetteInstance) {
            this.attachAnchorNode()
        }
        this.attributesContainer.initialize(this.attributes)

        if (this.shouldRenderAttributes()) {
            this.attributesContainer.renderSpecialAttributes()
        }

        this.bindNode()
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
        if (this.shouldRender()) {
            return document.createElement(this.tagName as string)
        }
    }

    protected shouldRenderAttributes(): boolean {
        return !!this.attributes
    }

    // todo: cache result
    protected checkIfPrevNodesHasElseAndShouldRender(
        virtualElement: VirtualElement
    ): boolean {
        let index = this.childVirtualNodes.indexOf(virtualElement)

        if (index > 0) {
            let child
            do {
                child = this.childVirtualNodes[--index] as VirtualElement
                if (child.shouldRender()) {
                    return true
                }
            } while (index >= 0
                && child[ElementSymbol]
                && child.getShouldListenToElse()
            )
        }

        return false
    }
}
