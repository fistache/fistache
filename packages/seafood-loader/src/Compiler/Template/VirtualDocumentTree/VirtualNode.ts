import {VirtualElement} from "./VirtualElement";

export abstract class VirtualNode extends VirtualElement {
    protected parsedNode: any;

    public setParsedNode(parsedNode: any): void {
        this.parsedNode = parsedNode;
    }

    public getParsedNode(): any {
        return this.parsedNode;
    }

    protected appendRenderedElement(): void {
        if (this.parentVirtualElement) {
            const parentBuildedNode = this.parentVirtualElement.getBuildedNode();
            const renderedNode = this.getBuildedNode();

            if (parentBuildedNode && renderedNode) {
                const previousSiblingNode = this.getPreviousSiblingNode();
                let nextSiblingNode = null;

                if (previousSiblingNode) {
                    nextSiblingNode = previousSiblingNode.nextSibling || previousSiblingNode;
                }

                parentBuildedNode.insertBefore(renderedNode, nextSiblingNode);
            }
        }
    }
}
