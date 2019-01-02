import {VirtualTagAttributesManager} from "./Attributes/VirtualTagAttributesManager";
import {VirtualTagNode} from "./Nodes/VirtualTagNode";
import {VirtualElement} from "./VirtualElement";
import {VirtualNode} from "./VirtualNode";
import {PROXY_TARGET_SYMBOL} from "@seafood/app";

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

    protected forOfExpression?: VirtualTagNodeForExpression;
    protected forInExpression?: VirtualTagNodeForExpression;
    protected forNExpression?: VirtualTagNodeForExpression;

    private readonly attributesManager: VirtualTagAttributesManager;

    private isBuildedNodeAttachedMarker: boolean;

    public constructor() {
        super();

        this.attributesManager = new VirtualTagAttributesManager(this);
        this.collection = [];
        this.isBuildedNodeAttachedMarker = false;
    }

    public beforeRender(): void {
        this.attributesManager.initialize();
    }

    public render(): void {
        this.attributesManager.renderAtShapedCollectionAttributes();

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

        this.attachBuildedNode();
    }

    public attachBuildedNode(): void {
        super.attachBuildedNode();

        this.isBuildedNodeAttachedMarker = true;
    }

    public isBuildedNodeAttached(): boolean {
        return this.isBuildedNodeAttachedMarker;
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

    public getCollection(): VirtualTagNode[] {
        return this.collection;
    }

    public getCollectionInReversedOrder(): VirtualTagNode[] {
        const virtualTagNodes: VirtualTagNode[] = [];

        for (const index in this.collection) {
            if (this.collection.hasOwnProperty(index)) {
                virtualTagNodes.push(this.collection[index]);
            }
        }

        return virtualTagNodes.reverse();
    }

    public useCollection(callback: (element: VirtualTagNode) => void): void {
        for (const index in this.collection) {
            if (this.collection.hasOwnProperty(index)) {
                callback(this.collection[index]);
            }
        }
    }

    public removeBuildedNode(): void {
        this.detachCollection();

        this.buildedNode = null;
        this.collection = [];
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
        this.updateForExpression(updatedExpressionValue, () => {
            this.renderForOfExpression();
        }, this.forOfExpression);
    }

    public updateForInExpression(updatedExpressionValue: any): void {
        this.updateForExpression(updatedExpressionValue, () => {
            this.renderForInExpression();
        }, this.forInExpression);
    }

    public updateForNExpression(updatedExpressionValue: any): void {
        if (this.forNExpression && Number.isInteger(this.forNExpression.value) && this.forNExpression.value >= 0) {
            const previousValue = this.collection.length;
            const difference = updatedExpressionValue - previousValue;
            this.forNExpression.value = updatedExpressionValue;

            if (difference < 0) {
                const rudenantIndecies: any[] = [];

                for (let i = updatedExpressionValue; i < previousValue; i++) {
                    rudenantIndecies.push(i);
                }

                this.cleanCollection(rudenantIndecies);
            }

            this.renderForNExpression();
        }
    }

    public updateForExpression(
        updatedExpressionValue: any,
        callback: () => void,
        forExpression?: VirtualTagNodeForExpression,
    ): void {
        if (forExpression) {
            forExpression.value = updatedExpressionValue;

            if (Array.isArray(updatedExpressionValue)) {
                const rudenantIndecies: any[] = [];

                for (const valueIndex in this.collection) {
                    if (this.collection.hasOwnProperty(valueIndex)) {
                        if (!updatedExpressionValue.hasOwnProperty(valueIndex)) {
                            rudenantIndecies.push(valueIndex);
                        }
                    }
                }

                this.cleanCollection(rudenantIndecies, (index: number) => {
                    if (forExpression) {
                        let value = forExpression.value;

                        // get original object cause we use value.splice
                        // and we don't want to trigger rerender one more time
                        if (value[PROXY_TARGET_SYMBOL]) {
                            value = value[PROXY_TARGET_SYMBOL];
                        }

                        value.splice(index, 1);
                    }
                });

                callback();
            } else {
                // todo: implement object @for rendering
            }
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

    protected cleanCollection(rudenantIndecies: number[], callback?: (index: number) => void): void {
        const collection = this.collection.slice();

        for (const index of rudenantIndecies) {
            this.collection[index].removeBuildedNodeAndDependencies();
            collection.splice(index, 1);

            if (callback) {
                callback(index);
            }
        }

        this.collection = collection;
    }

    protected cleanCollectionWholly(callback?: (index: number) => void): void {
        for (const index in this.collection) {
            if (this.collection.hasOwnProperty(index)) {
                this.collection[index].removeBuildedNodeAndDependencies();
                this.collection.splice(+index, 1);

                if (callback) {
                    callback(+index);
                }
            }
        }
    }

    protected renderForOfExpression(): void {
        if (this.forOfExpression) {
            for (const valueIndex in this.forOfExpression.value) {
                if (this.forOfExpression.value.hasOwnProperty(valueIndex) &&
                    !this.collection.hasOwnProperty(valueIndex)
                ) {
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
        if (this.forInExpression) {
            if (Number.isInteger(this.forInExpression.value) && this.forInExpression.value >= 0) {
                this.forNExpression = this.forInExpression;
                this.renderForNExpression();
            } else {
                for (const valueIndex in this.forInExpression.value) {
                    if (this.forInExpression.value.hasOwnProperty(valueIndex) &&
                        !this.collection.hasOwnProperty(valueIndex)
                    ) {
                        this.renderSingleTag(+valueIndex, (virtualTagNode: VirtualTagNode) => {
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
        if (this.forNExpression &&
            Number.isInteger(this.forNExpression.value) &&
            this.forNExpression.value >= 0
        ) {
            for (let i = this.collection.length; i < this.forNExpression.value; i++) {
                if (this.forNExpression.variableName) {
                    this.renderSingleTag(+i, (virtualTagNode: VirtualTagNode) => {
                        if (this.forNExpression && this.forNExpression.variableName) {
                            const scope = virtualTagNode.getScope();
                            scope.setVariable(this.forNExpression.variableName, () => {
                                return i;
                            });
                        }
                    });
                } else {
                    this.renderSingleTag(+i);
                }
            }
        } else {
            this.cleanCollectionWholly();
        }
    }

    private createVirtualTagNode(position: number): VirtualTagNode {
        const virtualTagNode = new VirtualTagNode();
        const virtualTagNodeScope = virtualTagNode.getScope();
        const collectionScope = this.getScope();

        virtualTagNode.setParsedNode(this.parsedNode);
        virtualTagNode.setPosition(position);
        virtualTagNode.setParentVirtualElement(this);
        virtualTagNode.setChildVirtualElements(this.getChildVirtualElements(virtualTagNode));
        virtualTagNode.getAttributesManager().extend(this.attributesManager);
        virtualTagNodeScope.setParentScope(collectionScope);
        virtualTagNodeScope.setContext(collectionScope.getContext());

        this.collection[position] = virtualTagNode;

        return virtualTagNode;
    }
}
