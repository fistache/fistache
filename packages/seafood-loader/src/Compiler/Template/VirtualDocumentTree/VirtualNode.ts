import { VirtualElement } from './VirtualElement'
import { VirtualTagNodeCollection } from './VirtualTagNodeCollection'

export abstract class VirtualNode extends VirtualElement {
    public render(): void {
        this.buildedNode = this.buildNode()
    }

    public getNextSiblingNode(position?: number, method?: string, checkCollection: boolean = true): Node | null {
        if (typeof position === 'undefined') {
            position = this.getPosition()
        }

        const parentVirtualElement = this.getParentVirtualElement()
        let nextSiblingNode: Node | null = null

        if (typeof position !== 'undefined' && parentVirtualElement) {
            // @ts-ignore
            const childVirtualElements = parentVirtualElement[method || 'getChildVirtualElementsReversed']()

            for (const childVirtualElement of childVirtualElements) {
                if (childVirtualElement !== this) {
                    let childBuildedNode = childVirtualElement.getBuildedNode()
                    const childPosition = childVirtualElement.getPosition()

                    if (childBuildedNode && childPosition) {
                        if (position < childPosition) {
                            // todo: optimize
                            if (checkCollection && childVirtualElement.isBuildedNodeAttached
                                && childVirtualElement.isBuildedNodeAttached()
                            ) {
                                const virtualTagNodeCollection = childVirtualElement as VirtualTagNodeCollection
                                const collection = virtualTagNodeCollection.getCollection()

                                if (collection.length) {
                                    for (const index in collection) {
                                        if (collection.hasOwnProperty(index)) {
                                            childBuildedNode = collection[index].getBuildedNode()
                                            if (childBuildedNode) {
                                                break
                                            }
                                        }
                                    }
                                }

                                while (!childBuildedNode) {
                                    childBuildedNode = this.getNextSiblingNode(++position, undefined, false)
                                }
                            }

                            nextSiblingNode = childBuildedNode
                        } else {
                            break
                        }
                    }
                }
            }
        }

        return nextSiblingNode
    }

    public attachBuildedNode(): void {
        if (this.parentVirtualElement) {
            const parentBuildedNode = this.parentVirtualElement.getBuildedNode()
            const buildedNode = this.getBuildedNode()

            if (parentBuildedNode && buildedNode) {
                parentBuildedNode.insertBefore(buildedNode, this.getNextSiblingNode())
            }
        }
    }

    protected abstract buildNode(): Node | undefined | null;
}
