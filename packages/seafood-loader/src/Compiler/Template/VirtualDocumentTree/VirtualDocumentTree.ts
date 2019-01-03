import { VirtualNode } from './VirtualNode'

export class VirtualDocumentTree extends VirtualNode {
    public render(): void {
        super.render()
        this.attachBuildedNode()
        this.extendChildVirtualElementsAndRender()
    }

    public attachBuildedNode(): void {
        const buildedNode = this.getBuildedNode()

        if (this.parentNode && buildedNode) {
            this.parentNode.appendChild(buildedNode)
        }
    }

    protected buildNode(): Node {
        const node = document.createElement('div')
        node.setAttribute('id', 'app-tree')

        return node
    }
}
