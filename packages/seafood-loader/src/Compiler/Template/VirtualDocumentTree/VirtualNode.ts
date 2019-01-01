import {VirtualElement} from "./VirtualElement";

export abstract class VirtualNode extends VirtualElement {
    public render(): void {
        this.buildedNode = this.buildNode();
    }

    public getNextSiblingNode(position?: number, method?: string): Node | null {
        if (typeof position === "undefined") {
            position = this.getPosition();
        }

        const parentVirtualElement = this.getParentVirtualElement();
        let nextSiblingNode: Node | null = null;

        if (typeof position !== "undefined" && parentVirtualElement) {
            // @ts-ignore
            const childVirtualElements = parentVirtualElement[method || "getChildVirtualElementsReversed"]();

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

    public attachBuildedNode(): void {
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
