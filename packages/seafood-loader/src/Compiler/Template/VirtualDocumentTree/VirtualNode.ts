import {VirtualElement} from "./VirtualElement";

export abstract class VirtualNode extends VirtualElement {
    public render(): void {
        this.buildedNode = this.buildNode();
    }

    public getNextSiblingNode(): Node | null {
        const parentVirtualElement = this.getParentVirtualElement();
        const position = this.getPosition();
        let nextSiblingNode: Node | null = null;

        if (position && parentVirtualElement) {
            const childVirtualElements = parentVirtualElement.getChildVirtualElementsReversed();

            for (const childVirtualElement of childVirtualElements) {
                if (childVirtualElement !== this) {
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

    protected appendRenderedElement(): void {
        if (this.parentVirtualElement) {
            const parentBuildedNode = this.parentVirtualElement.getBuildedNode();
            const buildedNode = this.getBuildedNode();

            if (parentBuildedNode && buildedNode) {
                parentBuildedNode.insertBefore(buildedNode, this.getNextSiblingNode());
            }
        }
    }

    protected abstract buildNode(): Node | undefined | null;
}
