import { VirtualElement } from './VirtualElement'
import { VirtualNode } from './VirtualNode'

export class VirtualSlot extends VirtualElement {
    private readonly id: string
    private readonly embeddedContent: VirtualNode[] | null

    constructor(id: string, embeddedContent: VirtualNode[] | null) {
        super()
        this.id = id
        this.embeddedContent = embeddedContent
    }

    public getId(): string {
        return this.id
    }

    public getEmbeddedContent(): VirtualNode[] | null {
        return this.embeddedContent
    }

    public shouldRenderChildVirtualNodes(): boolean {
        return false
    }

    protected makeNode(): void {}
}
