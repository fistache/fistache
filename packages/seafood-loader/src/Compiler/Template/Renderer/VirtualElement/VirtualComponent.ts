import { CompiledComponent } from '@seafood/app'
import { Component } from '@seafood/component'
import { ParsedData } from '../../../ParsedData'
import { VirtualElement } from './VirtualElement'
import { VirtualNode } from './VirtualNode'

export class VirtualComponent extends VirtualElement {
    private readonly compiledComponent: CompiledComponent

    constructor(
        parsedData: ParsedData,
        position: number,
        parentVirtualNode: VirtualNode,
        component: CompiledComponent
    ) {
        super(parsedData, position, parentVirtualNode)
        this.compiledComponent = component
    }

    public beforeRender() {
        super.beforeRender()
        this.attibuteContainer.renderDynamicAttributes()
        this.compiledComponent.getComponent().checkRequeredAttributesExistance()
    }

    public render() {
        this.attibuteContainer.renderTechnicalAttributes()

        if (this.isPresent()) {
            const parentNode = this.parentVirtualNode.getNode()

            this.compiledComponent.renderer.embeddedContent = this.childVirtualNodes
            this.compiledComponent.setVirtualNode(this)
            this.compiledComponent.initialize()

            this.node = this.compiledComponent.render(parentNode)
        }
    }

    public shouldRenderChildVirtualNodes() {
        return false
    }

    public rerender() {
        this.delete()

        if (this.isPresent()) {
            const parentNode = this.parentVirtualNode.getNode()
            const nextSibling = this.parentVirtualNode.getNextSiblingNode(this.getPosition())

            this.compiledComponent.renderer.embeddedContent = this.cloneVirtualChildNodes()
            this.node = this.compiledComponent.render(parentNode, nextSibling)
        }
    }

    public clone(): VirtualNode {
        return super.clone(new VirtualComponent(
            this.parsedData,
            this.position.primary,
            this.parentVirtualNode,
            this.compiledComponent.clone()
        ))
    }

    public getCompiledComponent(): CompiledComponent {
        return this.compiledComponent
    }

    public getComponent(): Component {
        return this.getCompiledComponent().component
    }

    private cloneVirtualChildNodes(): VirtualNode[] {
        const children: VirtualNode[] = []

        for (const child of this.childVirtualNodes) {
            children.push(child.clone())
        }

        return children
    }
}
