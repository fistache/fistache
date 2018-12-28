import {VirtualTagAttributesManager} from "./Attributes/VirtualTagAttributesManager";
import {VirtualTagNode} from "./Nodes/VirtualTagNode";
import {VirtualElement} from "./VirtualElement";
import {VirtualNode} from "./VirtualNode";

/**
 * More details in presentState variable declaration in
 * VirtualElement class.
 */
export enum VirtualTagNodePresentState {
    Present,
    Missing,
}

export interface VirtualTagNodeForExpression {
    variableName: string;
    value: any;
}

export class VirtualTagNodeCollection extends VirtualNode {
    protected collection: VirtualTagNode[];

    /**
     * Used for @if conditinal rendering.
     *
     * A virtual element should not to be rendered if state
     * is missing.
     */
    protected presentState: VirtualTagNodePresentState;

    protected forOfExpression?: VirtualTagNodeForExpression;
    protected forInExpression?: VirtualTagNodeForExpression;
    protected forNExpression?: any;

    private attributesManager: VirtualTagAttributesManager;

    private hasBeenIfAttributeValueChanged: boolean = false;

    public constructor() {
        super();

        this.attributesManager = new VirtualTagAttributesManager(this);
        this.presentState = VirtualTagNodePresentState.Present;
        this.collection = [];
    }

    public beforeRender(): void {
        this.attributesManager.initialize();
    }

    public render(): void {
        this.attributesManager.renderAtShapedAttributes();

        if (this.isPresent()) {
            super.render();

            if (this.forOfExpression) {
                // this.renderForOfExpression();
            } else {
                this.renderSingleTag();
            }

            this.attributesManager.renderDynamicAndStaticAttributes();
            this.appendRenderedElement();
        }
    }

    public setForOfExpression(forOfExpression: VirtualTagNodeForExpression): void {
        this.forOfExpression = forOfExpression;
    }

    public useCollection(callback: (element: VirtualTagNode) => void): void {
        for (const virtualTagNode of this.collection) {
            callback(virtualTagNode);
        }
    }

    public removeBuildedNodeFromDom(): void {
        for (const virtualTagNode of this.collection) {
            const buildedNode = virtualTagNode.getBuildedNode();

            if (buildedNode && buildedNode.parentNode) {
                buildedNode.parentNode.removeChild(buildedNode);
            }
        }

        this.buildedNode = null;
        this.collection = [];
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

            if (this.isPresent()) {
                this.attachBuildedNode();
            } else {
                this.detachBuildedNode();
            }
        }
    }

    public setPresentState(presentState: VirtualTagNodePresentState): void {
        this.presentState = presentState;
    }

    public getPresentState(): VirtualTagNodePresentState {
        return this.presentState;
    }

    public getChildVirtualElements(parentVirtualElement?: VirtualElement): VirtualElement[] {
        if (parentVirtualElement) {
            return this.childVirtualElements.map((virtualElement: VirtualElement) => {
                virtualElement.setParentVirtualElement(parentVirtualElement);
                return virtualElement;
            });
        } else {
            return this.childVirtualElements;
        }
    }

    protected buildNode(): Node | undefined | null {
        return document.createDocumentFragment();
    }

    protected renderSingleTag(): void {
        const virtualTagNode = this.createVirtualTagNode();
        virtualTagNode.beforeRender();
        virtualTagNode.render();
    }

    protected renderForOfExpression(): void {
        if (this.isPresent() && this.forOfExpression) {
            // for (const value of this.forOfExpression.value) {
            //     this.renderSingleTag();
            // }
        }
    }

    protected attachBuildedNode(): void {
        // если ребенок будет тоже коллекцией?
        // надо будет аттачить/детатчить и ребенка тоже
    }

    protected detachBuildedNode(): void {
        //
    }

    private isPresent(): boolean {
        return this.getPresentState() === VirtualTagNodePresentState.Present;
    }

    private createVirtualTagNode(): VirtualTagNode {
        const virtualTagNode = new VirtualTagNode();
        const virtualTagNodeScope = virtualTagNode.getScope();

        const collectionScope = this.getScope();
        const componentScope = collectionScope.getComponentScope();

        virtualTagNode.setParsedNode(this.parsedNode);
        virtualTagNode.setChildVirtualElements(this.getChildVirtualElements(virtualTagNode));
        virtualTagNode.setParentVirtualElement(this);
        virtualTagNodeScope.setParentScope(collectionScope);

        if (componentScope) {
            virtualTagNodeScope.setComponentScope(componentScope);
        }

        this.collection.push(virtualTagNode);

        return virtualTagNode;
    }
}
