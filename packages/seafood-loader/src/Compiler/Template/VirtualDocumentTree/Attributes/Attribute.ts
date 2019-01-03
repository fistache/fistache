import { VirtualNode } from '../VirtualNode'

export abstract class Attribute {
    protected virtualNode?: VirtualNode

    protected name: string

    protected value: string

    public constructor(name: string, value: string) {
        this.name = name
        this.value = value.trim()
    }

    public setVirtualNode(virtualNode: VirtualNode) {
        this.virtualNode = virtualNode
    }

    public abstract getName(): string;

    public abstract append(): void;

    public getVirtualNode(): VirtualNode | undefined {
        return this.virtualNode
    }
}
