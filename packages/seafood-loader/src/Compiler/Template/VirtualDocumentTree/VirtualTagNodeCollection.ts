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

    public updateForOfExpression(updatedExpressionValue: any): void {
        const typeOfUpdatedExpressionValue = typeof updatedExpressionValue;
        const typeOfExpressionValue = typeof this.collection;
        let isTypeOfExpressionNotChanged = typeOfUpdatedExpressionValue === typeOfExpressionValue;

        if (isTypeOfExpressionNotChanged && typeOfExpressionValue === "object") {
            isTypeOfExpressionNotChanged =
                Array.isArray(updatedExpressionValue) === Array.isArray(this.collection);
        }

        if (isTypeOfExpressionNotChanged && this.forOfExpression) {
            if (Array.isArray(updatedExpressionValue)) {
                const rudenantIndecies: any[] = [];

                for (const valueIndex in this.collection) {
                    if (this.collection.hasOwnProperty(valueIndex)) {
                        if (!updatedExpressionValue.hasOwnProperty(valueIndex)) {
                            rudenantIndecies.push(valueIndex);
                        }
                    }
                }

                for (const updatedValueIndex in updatedExpressionValue) {
                    if (updatedExpressionValue.hasOwnProperty(updatedValueIndex)) {
                        if (!this.collection.hasOwnProperty(updatedValueIndex)) {
                            this.forOfExpression.value[updatedValueIndex] = updatedExpressionValue[updatedValueIndex];
                        }
                    }
                }

                this.cleanCollection(rudenantIndecies, (index: number) => {
                    if (this.forOfExpression) {
                        delete this.forOfExpression.value[index];
                    }
                });

                this.renderForOfExpression();
            }
        } else {
            // tmp
            console.log("changed");

            // notify on new element
        }
    }

    protected buildNode(): Node | undefined | null {
        return document.createDocumentFragment();
    }

    protected renderSingleTag(position?: number, afterCreate?: (virtualTagNode: VirtualTagNode) => void): void {
        if (!position) {
            position = this.collection.length;
        }

        const virtualTagNode = this.createVirtualTagNode(position);

        if (afterCreate) {
            afterCreate(virtualTagNode);
        }

        virtualTagNode.beforeRender();
        virtualTagNode.render();
    }

    protected cleanCollection(rudenantIndecies: number[], callback: (index: number) => void): void {
        for (const index of rudenantIndecies) {
            if (this.collection.hasOwnProperty(index)) {
                const virtualTagNode = this.collection[index];
                virtualTagNode.removeBuildedNode();
                delete this.collection[index];
                callback(index);
            }
        }
    }

    protected renderForOfExpression(): void {
        if (this.isPresent() && this.forOfExpression) {
            for (const valueIndex in this.forOfExpression.value) {
                if (this.forOfExpression.value.hasOwnProperty(valueIndex) &&
                    !this.collection.hasOwnProperty(valueIndex)
                ) {
                    // console.log(`render in ${valueIndex} index`);
                    this.renderSingleTag(+valueIndex, (virtualTagNode: VirtualTagNode) => {
                        if (this.forOfExpression && this.forOfExpression.variableName) {
                            const scope = virtualTagNode.getScope();
                            scope.setVariable(this.forOfExpression.variableName, () => {
                                if (this.forOfExpression) {
                                    return this.forOfExpression.value[valueIndex];
                                }
                            });
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
                for (const valueIndex in this.forInExpression.value) {
                    if (this.forInExpression.value.hasOwnProperty(valueIndex)) {
                        this.renderSingleTag(undefined, (virtualTagNode: VirtualTagNode) => {
                            if (this.forInExpression && this.forInExpression.variableName) {
                                const scope = virtualTagNode.getScope();
                                scope.setVariable(this.forInExpression.variableName, () => {
                                    return valueIndex;
                                });
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
                    this.renderSingleTag(undefined, (virtualTagNode: VirtualTagNode) => {
                        if (this.forNExpression && this.forNExpression.variableName) {
                            const scope = virtualTagNode.getScope();
                            scope.setVariable(this.forNExpression.variableName, () => {
                                return i;
                            });
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

    private createVirtualTagNode(position: number): VirtualTagNode {
        const virtualTagNode = new VirtualTagNode();

        const virtualTagNodeScope = virtualTagNode.getScope();

        const collectionScope = this.getScope();
        const componentScope = collectionScope.getComponentScope();

        virtualTagNode.setParsedNode(this.parsedNode);
        virtualTagNode.setPosition(position);
        virtualTagNode.setParentVirtualElement(this);
        virtualTagNode.setChildVirtualElements(this.getChildVirtualElements(virtualTagNode));
        virtualTagNodeScope.setParentScope(collectionScope);

        if (componentScope) {
            virtualTagNodeScope.setComponentScope(componentScope);
        }

        this.collection[position] = virtualTagNode;

        return virtualTagNode;
    }
}
