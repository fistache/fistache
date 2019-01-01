import {VirtualNode} from "../VirtualNode";
import {VirtualTagNodeCollection} from "../VirtualTagNodeCollection";

export class VirtualTagNode extends VirtualNode {
    public render(): void {
        super.render();
        this.attachBuildedNode();
        this.extendChildVirtualElementsAndRender();
    }

    public getNextSiblingNode(): Node | null {
        const parentVirtualElement = this.getParentVirtualElement() as VirtualTagNodeCollection;
        const position = this.getPosition();
        let nextSiblingNode: Node | null = null;

        if (position && parentVirtualElement) {
            let childVirtualElements: VirtualTagNode[];

            if (parentVirtualElement.isBuildedNodeAttached()) {
                childVirtualElements = parentVirtualElement.getCollectionInReversedOrder();
            } else {
                childVirtualElements = [];
            }

            for (const index in childVirtualElements) {
                if (childVirtualElements.hasOwnProperty(index) && childVirtualElements[index] !== this) {
                    const childVirtualElement = childVirtualElements[index];
                    const childBuildedNode = childVirtualElement.getBuildedNode();
                    const childPosition = childVirtualElement.getPosition();

                    if (childBuildedNode && childPosition) {
                        if (position < childPosition) {
                            nextSiblingNode = childBuildedNode;
                        } else {
                            break;
                        }
                    }
                }
            }
        }

        return nextSiblingNode;
    }

    public attachBuildedNode(): void {
        const parentVirtualElement = this.getParentVirtualElement() as VirtualTagNodeCollection;

        if (parentVirtualElement) {
            let parentBuildedNode;

            if (parentVirtualElement.isBuildedNodeAttached()) {
                const parentOfParentVirtualTagNode = parentVirtualElement.getParentVirtualElement();

                if (parentOfParentVirtualTagNode) {
                    parentBuildedNode = parentOfParentVirtualTagNode.getBuildedNode();
                }
            } else {
                parentBuildedNode = parentVirtualElement.getBuildedNode();
            }

            const buildedNode = this.getBuildedNode();

            if (parentBuildedNode && buildedNode) {
                parentBuildedNode.insertBefore(buildedNode, this.getNextSiblingNode());
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
