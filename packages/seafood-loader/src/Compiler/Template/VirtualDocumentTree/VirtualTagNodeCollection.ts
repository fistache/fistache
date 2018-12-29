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
    variableName?: string;
    expression: string;
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
    protected forNExpression?: VirtualTagNodeForExpression;

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
                this.renderForOfExpression();
            } else if (this.forInExpression) {
                this.renderForInExpression();
            } else if (this.forNExpression) {
                this.renderForNExpression();
            } else {
                this.renderSingleTag();
            }

            this.attributesManager.renderDynamicAndStaticAttributes();
            this.attachBuildedNode();
        }
    }

    public setForOfExpression(forOfExpression: VirtualTagNodeForExpression): void {
        this.forOfExpression = forOfExpression;
    }

    public setForInExpression(forInExpression: VirtualTagNodeForExpression): void {
        this.forInExpression = forInExpression;
    }

    public setForNExpression(forNExpression: VirtualTagNodeForExpression): void {
        this.forNExpression = forNExpression;
    }

    public useCollection(callback: (element: VirtualTagNode) => void): void {
        for (const virtualTagNode of this.collection) {
            callback(virtualTagNode);
        }
    }

    public removeBuildedNode(): void {
        this.detachCollection();

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
                this.attachCollection();
            } else {
                this.detachCollection();
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
            const childVirtualElements: VirtualElement[] = [];

            for (const childVirtualElement of this.childVirtualElements) {
                const clonedChildVirtualElement = childVirtualElement.clone();
                clonedChildVirtualElement.setParentVirtualElement(parentVirtualElement);
                childVirtualElements.push(clonedChildVirtualElement);
            }

            return childVirtualElements;
        } else {
            return this.childVirtualElements;
        }
    }

    public attachCollection(): void {
        for (const virtualTagNode of this.collection) {
            virtualTagNode.attachBuildedNode();
        }
        this.attachBuildedNode();
    }

    public detachCollection(): void {
        for (const virtualTagNode of this.collection) {
            virtualTagNode.detachBuildedNode();
        }
    }

    protected buildNode(): Node | undefined | null {
        return document.createDocumentFragment();
    }

    protected renderSingleTag(afterCreate?: (virtualTagNode: VirtualTagNode) => void): void {
        const virtualTagNode = this.createVirtualTagNode();

        if (afterCreate) {
            afterCreate(virtualTagNode);
        }

        virtualTagNode.beforeRender();
        virtualTagNode.render();
    }

    protected renderForOfExpression(): void {
        if (this.isPresent() && this.forOfExpression) {
            for (const valueIndex in this.forOfExpression.value) {
                if (this.forOfExpression.value.hasOwnProperty(valueIndex)) {
                    this.renderSingleTag((virtualTagNode: VirtualTagNode) => {
                        if (this.forOfExpression && this.forOfExpression.variableName) {
                            const scope = virtualTagNode.getScope();
                            if (typeof this.forOfExpression.value[valueIndex] === "object") {
                                scope.setVariable(this.forOfExpression.variableName, new Proxy({}, {
                                    get: (_target: object, propertyKey: PropertyKey): any => {
                                        if (this.forOfExpression) {
                                            return scope.executeExpressionWithoutTracking(
                                                this.forOfExpression.expression,
                                            )[valueIndex][propertyKey];
                                        }
                                    },
                                }));
                            } else {
                                scope.setVariable(
                                    this.forOfExpression.variableName,
                                    this.forOfExpression.value[valueIndex],
                                );
                            }
                        }
                    });
                }
            }
        }
    }

    protected renderForInExpression(): void {
        if (this.isPresent() && this.forInExpression) {
            if (Number.isInteger(this.forInExpression.value) && this.forInExpression.value >= 0) {
                this.forNExpression = this.forInExpression;
                this.renderForNExpression();
            } else {
                for (const value in this.forInExpression.value) {
                    if (this.forInExpression.value.hasOwnProperty(value)) {
                        this.renderSingleTag((virtualTagNode: VirtualTagNode) => {
                            if (this.forInExpression && this.forInExpression.variableName) {
                                const scope = virtualTagNode.getScope();
                                scope.setVariable(this.forInExpression.variableName, value);
                            }
                        });
                    }
                }
            }
        }
    }

    protected renderForNExpression(): void {
        if (this.isPresent() &&
            this.forNExpression &&
            Number.isInteger(this.forNExpression.value) &&
            this.forNExpression.value >= 0
        ) {
            for (let i = 0; i < this.forNExpression.value; i++) {
                if (this.forNExpression.variableName) {
                    this.renderSingleTag((virtualTagNode: VirtualTagNode) => {
                        if (this.forNExpression && this.forNExpression.variableName) {
                            const scope = virtualTagNode.getScope();
                            scope.setVariable(this.forNExpression.variableName, i);
                        }
                    });
                } else {
                    this.renderSingleTag();
                }
            }
        }
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
        virtualTagNode.setParentVirtualElement(this);
        virtualTagNode.setChildVirtualElements(this.getChildVirtualElements(virtualTagNode));
        virtualTagNodeScope.setParentScope(collectionScope);

        if (componentScope) {
            virtualTagNodeScope.setComponentScope(componentScope);
        }

        this.collection.push(virtualTagNode);

        return virtualTagNode;
    }
}
