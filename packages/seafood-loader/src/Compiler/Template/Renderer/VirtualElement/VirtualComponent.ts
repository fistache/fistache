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
        this.compiledComponent.setVirtualNode(this)
        this.attibuteContainer.renderDynamicAttributes()
        this.compiledComponent.getComponent().checkRequeredAttributesExistance()
    }

    public render() {
        this.attibuteContainer.renderTechnicalAttributes()

        if (this.isPresent()) {
            const parentNode = this.parentVirtualNode.getNode()
            this.node = this.compiledComponent.render(parentNode)
            this.afterRender()
        }
    }

    public afterRender() {
        // must be empty because component render
        // attributes before render, not after
    }

    public rerender() {
        if (this.isPresent()) {
            const parentNode = this.parentVirtualNode.getNode()
            const nextSibling = this.parentVirtualNode.getNextSiblingNode(this.getPosition())
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
}
