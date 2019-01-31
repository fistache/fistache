import { VirtualElement } from './VirtualElement'

export abstract class VirtualNode {
    private node: Node | null = null

    private parentVirtualNode?: VirtualElement

    public render() {
        this.beforeRender()
        this.renderNode()
        this.afterRender()
    }

    public getNode(): Node | null {
        return this.node
    }

    protected beforeRender() {
        this.bindNode()
    }

    protected renderNode() {
        if (this.parentVirtualNode) {
            const node = this.getNode()
            const parentNode = this.parentVirtualNode.getNode()

            if (node && parentNode) {
                parentNode.appendChild(node)
            }
        }
    }

    protected afterRender() {
        // empty by default
    }

    protected makeNode(): Node | null | void {
        // empty by default
    }

    private bindNode() {
        const node = this.makeNode()

        if (node) {
            this.node = node
        }
    }
}
