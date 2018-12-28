import {VirtualNode} from "../VirtualNode";

export class VirtualTagNode extends VirtualNode {
    public render(): void {
        super.render();
        this.appendRenderedElement();
        this.extendChildVirtualElementsAndRender();
    }

    public getBuildedNode(): Element | undefined | null {
        return super.getBuildedNode() as Element;
    }

    protected buildNode(): Element | undefined | null {
        return document.createElement(this.parsedNode.name);
    }
}
