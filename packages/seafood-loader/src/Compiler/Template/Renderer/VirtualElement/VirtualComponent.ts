import { CompiledComponent } from '@seafood/app'
import { ParsedData } from '../../Parser/ParsedData'
import { VirtualNode } from './VirtualNode'

export class VirtualComponent extends VirtualNode {
    private compiledComponent: CompiledComponent

    constructor(component: CompiledComponent, position: number, parentVirtualNode: VirtualNode) {
        super({} as ParsedData, position, parentVirtualNode)
        this.compiledComponent = component
    }

    public beforeRender() {
        super.beforeRender()
    }

    public render() {
        const parentNode = this.parentVirtualNode.getNode()
        this.compiledComponent.getRenderer().render(parentNode, this.compiledComponent.component)
    }

    protected makeNode(): void {}
}
