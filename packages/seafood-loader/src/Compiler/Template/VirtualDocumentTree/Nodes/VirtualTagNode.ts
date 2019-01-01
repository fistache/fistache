import {VirtualNode} from "../VirtualNode";
import {VirtualTagNodeCollection} from "../VirtualTagNodeCollection";

export class VirtualTagNode extends VirtualNode {
    public render(): void {
        super.render();
        this.attachBuildedNode();
        this.extendChildVirtualElementsAndRender();
    }

    public getNextSiblingNode(position?: number): Node | null {
        const parentVirtualElement = this.getParentVirtualElement() as VirtualTagNodeCollection;

        if (!parentVirtualElement.isBuildedNodeAttached()) {
            return null;
        }

        return super.getNextSiblingNode(position, "getCollectionInReversedOrder");
    }

    public attachBuildedNode(): void {
        const parentVirtualElement = this.getParentVirtualElement() as VirtualTagNodeCollection;

        if (parentVirtualElement) {
            let parentBuildedNode;
            let nextSiblingNode = this.getNextSiblingNode();

            if (parentVirtualElement.isBuildedNodeAttached()) {
                const parentOfParentVirtualTagNode = parentVirtualElement.getParentVirtualElement() as VirtualNode;
                const parentVirtualElementPosition = parentVirtualElement.getPosition();

                parentBuildedNode = parentOfParentVirtualTagNode.getBuildedNode();
                nextSiblingNode = parentVirtualElement.getNextSiblingNode(parentVirtualElementPosition);
            } else {
                parentBuildedNode = parentVirtualElement.getBuildedNode();
            }

            const buildedNode = this.getBuildedNode();

            if (parentBuildedNode && buildedNode) {
                parentBuildedNode.insertBefore(buildedNode, nextSiblingNode);
            }
        }
    }

    public getBuildedNode(): Element | undefined | null {
        return super.getBuildedNode() as Element;
    }

    protected buildNode(): Element | undefined | null {
        return document.createElement(this.parsedNode.name);
    }
}
