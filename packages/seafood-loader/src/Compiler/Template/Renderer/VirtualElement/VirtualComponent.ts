import { CompiledComponent } from '@seafood/app'
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

    public render() {
        this.attibuteContainer.renderTechnicalAttributes()

        if (this.isPresent()) {
            const parentNode = this.parentVirtualNode.getNode()
            this.compiledComponent.setVirtualNode(this)
            this.node = this.compiledComponent.render(parentNode)
        }
    }

    public attach() {
        this.delete()
        if (this.isPresent()) {
            const parentNode = this.parentVirtualNode.getNode()
            const nextSibling = this.parentVirtualNode.getNextSiblingNode(this.getPosition())
            this.node = this.compiledComponent.render(parentNode, nextSibling)
        }
    }

    public clone(): VirtualNode {
        return super.clone(new (this.constructor as any)(
            this.parsedData,
            this.position.primary,
            this.parentVirtualNode,
            this.compiledComponent
        ) as VirtualNode)
    }
}
