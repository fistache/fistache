import {VirtualTagAttributesManager} from "../Attributes/VirtualTagAttributesManager";
import {VirtualNode} from "../VirtualNode";
import {VirtualTagNodeCollection, VirtualTagNodePresentState} from "../VirtualTagNodeCollection";

export class VirtualTagNode extends VirtualNode {

    /**
     * Used for @if conditinal rendering.
     *
     * A virtual element should not to be rendered if state
     * is missing.
     */
    protected presentState: VirtualTagNodePresentState;

    private hasBeenIfAttributeValueChanged: boolean = false;

    private readonly attributesManager: VirtualTagAttributesManager;

    constructor() {
        super();

        this.attributesManager = new VirtualTagAttributesManager(this);
        this.presentState = VirtualTagNodePresentState.Present;
    }

    public getAttributesManager(): VirtualTagAttributesManager {
        return this.attributesManager;
    }

    public render(): void {
        this.attributesManager.renderAtShapedAttributes();

        if (this.isPresent()) {
            super.render();
            this.attachBuildedNode();
            this.extendChildVirtualElementsAndRender();
            this.attributesManager.renderDynamicAndStaticAttributes();
        }
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

    public removeBuildedNodeAndDependencies(): void {
        for (const childVirtualElement of this.childVirtualElements) {
            childVirtualElement.getScope().removeDependents();
        }

        super.removeBuildedNodeAndDependencies();
    }

    public getBuildedNode(): Element | undefined | null {
        return super.getBuildedNode() as Element;
    }

    public updateIfAttributeValue(expressionValue: any) {
        let presentState;

        if (expressionValue) {
            presentState = VirtualTagNodePresentState.Present;
        } else {
            presentState = VirtualTagNodePresentState.Missing;
        }

        this.hasBeenIfAttributeValueChanged = presentState !== this.getPresentState();
        if (this.hasBeenIfAttributeValueChanged) {
            this.setPresentState(presentState);

            if (this.getBuildedNode()) {
                if (this.isPresent()) {
                    this.attachBuildedNode();
                } else {
                    this.removeBuildedNode();
                }
            }
        }
    }

    public setPresentState(presentState: VirtualTagNodePresentState): void {
        this.presentState = presentState;
    }

    public getPresentState(): VirtualTagNodePresentState {
        return this.presentState;
    }

    protected buildNode(): Element | undefined | null {
        return document.createElement(this.parsedNode.name);
    }

    private isPresent(): boolean {
        return this.getPresentState() === VirtualTagNodePresentState.Present;
    }
}
