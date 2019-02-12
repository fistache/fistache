import { TagAttrib } from '@fistache/shared'
import { VirtualElement } from '../VirtualNode/VirtualElement'

export class StaticAttribute {
    protected virtualElement?: VirtualElement

    protected name: string
    protected value?: string

    constructor(attrib: TagAttrib) {
        this.name = attrib.name
        this.value = attrib.value
    }

    public getName(): string {
        return this.name
    }

    public append() {
        const virtualElement = this.getVirtualElement()
        const node = virtualElement!.getNode()

        if (node) {
            (node as Element).setAttribute(this.getName(), this.value || '')
        }
    }

    public setVirtualElement(virtualElement: VirtualElement) {
        this.virtualElement = virtualElement
    }

    public getVirtualElement(): VirtualElement | undefined {
        return this.virtualElement
    }
}
