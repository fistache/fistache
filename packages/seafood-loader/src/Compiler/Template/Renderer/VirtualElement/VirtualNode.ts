import { VirtualElement } from './VirtualElement'

export abstract class VirtualNode {
    // Reference to a DOM node seen after rendering.
    protected node?: Node | null

    // Virtual element where node'll be appended.
    protected parentVirtualElement?: VirtualElement | null

    // VirtualElementPackage can dynamically add a virtual
    // element so this property helps to find a nextSiblingNode.
    protected firstVirtualElement?: VirtualElement | null

    // It is applied like property above.
    //
    // P.S. It is possible to find a position of a virual
    // element using array of child element of parent element,
    // but in this implementation used next/first element
    // references.
    protected nextVirtualElement?: VirtualElement | null

    public beforeRender() {
        // It runs only once unlike render() method.
        // Can be empty.
    }

    public render() {
        this.node = this.makeNode()
    }

    public getNode(): Node | undefined | null {
        return this.node
    }

    public setParentVirtualElement(virtualElement: VirtualElement) {
        this.parentVirtualElement = virtualElement
    }

    protected abstract makeNode(): Node
}
