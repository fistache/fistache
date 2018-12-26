import {VirtualTagNodeComplex} from "./VirtualTagNodeComplex";

export class VirtualTagNode extends VirtualTagNodeComplex {
    public render(): void {
        super.render();
        this.appendRenderedElement();
        this.extendChildVirtualElementsAndRender();
    }

    protected buildNode(): Node | undefined | null {
        return document.createElement(this.parsedNode.name);
    }
}
