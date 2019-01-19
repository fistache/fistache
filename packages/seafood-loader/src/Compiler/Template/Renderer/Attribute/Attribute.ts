import { ParsedDataAttrib } from '../../../ParsedData'
import { VirtualElement } from '../VirtualElement/VirtualElement'

export abstract class Attribute {
    protected virtualElement?: VirtualElement

    protected name: string

    protected value: string

    constructor(attrib: ParsedDataAttrib) {
        this.name = attrib.name
        this.value = attrib.value.trim()
    }

    public abstract getName(): string

    public abstract append(): void

    public setVirtualElement(virtualElement: VirtualElement) {
        this.virtualElement = virtualElement
    }

    public getVirtualElement(): VirtualElement | undefined {
        return this.virtualElement
    }
}
