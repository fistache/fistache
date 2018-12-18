import {VirtualElement} from "./VirtualElement";

export class VirtualDocumentTree extends VirtualElement {
    public render(): void {
        super.render();
        this.appendRenderedElement();
        this.extendChildVirtualElementsAndRender();
    }

    protected buildNode(): Node {
        const node = document.createElement("div");
        node.setAttribute("id", "app-tree");

        return node;
    }

    protected appendRenderedElement(): void {
        const buildedNode = this.getBuildedNode();

        if (this.parentNode && buildedNode) {
            this.parentNode.appendChild(buildedNode);
        }
    }
}
