import { VirtualElement } from '../VirtualElement/VirtualElement'
import { Attribute } from './Attribute'

export class StaticAttribute extends Attribute {
    public getName(): string {
        return this.name
    }

    public append(): void {
        this.setAttribute(this.getName(), this.value)
    }

    protected setAttribute(name: string, value: string): void {
        const virtualElement = this.getVirtualElement() as VirtualElement
        const buildedNode = virtualElement.getNode() as Element

        if (buildedNode) {
            buildedNode.setAttribute(name, value)
        }
    }
}
