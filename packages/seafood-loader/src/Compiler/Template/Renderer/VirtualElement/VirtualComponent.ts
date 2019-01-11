import { CompiledComponent } from '@seafood/app'
import { ParsedData } from '../../Parser/ParsedData'
import { VirtualElement } from './VirtualElement'
import { VirtualNode } from './VirtualNode'

export class VirtualComponent extends VirtualElement {
    private compiledComponent: CompiledComponent

    constructor(component: CompiledComponent, position: number, parentVirtualNode: VirtualNode) {
        super({} as ParsedData, position, parentVirtualNode)
        this.compiledComponent = component
    }

    public beforeRender() {
        super.beforeRender()
    }

    public render() {
        this.attibuteContainer.renderTechnicalAttributes()

        if (this.isPresent()) {
            const parentNode = this.parentVirtualNode.getNode()
            this.compiledComponent.getRenderer().render(parentNode, this.compiledComponent.component)
        }
    }
}
