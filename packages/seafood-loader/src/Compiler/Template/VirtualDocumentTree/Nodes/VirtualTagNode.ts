import {VirtualNode} from "../VirtualNode";
import {VirtualTagAttributesManager} from "./VirtualTagNodeAttribute/VirtualTagAttributesManager";

/**
 * More details in presentState variable declaration in
 * VirtualElement class.
 */
export enum VirtualTagNodePresentState {
    Present,
    Missing,
}

export interface IForTagExpression {
    newVariableName: string;
    value: any;
}

export interface IBuildedElement {
    element: Element;
    id: number | string;
}

export class VirtualTagNode extends VirtualNode {
    /**
     * Used for @if conditinal rendering.
     *
     * A virtual element should not to be rendered if state
     * is missing.
     */
    protected presentState: VirtualTagNodePresentState;

    protected forOfData?: IForTagExpression;
    protected forInData?: IForTagExpression;
    protected forNData?: any;
    protected lastForId: number = 0;

    protected buildedNodes: IBuildedElement[];

    protected attributesManager: VirtualTagAttributesManager;

    public constructor() {
        super();

        this.attributesManager = new VirtualTagAttributesManager(this);
        this.presentState = VirtualTagNodePresentState.Present;
        this.buildedNodes = [];
    }

    public beforeRender(): void {
        super.beforeRender();
        this.attributesManager.initialize();
    }

    public render(): void {
        this.renderAtShapedAttributes();

        if (this.forOfData) {
            this.renderForOf();
        } else if (this.forInData) {
            this.renderForIn();
        } else if (this.forNData) {
            this.renderForN();
        } else {
            this.renderFragment();
        }
    }

    public setForOfData(forOfData: IForTagExpression) {
        this.forOfData = forOfData;
    }

    public setForInData(forInData: IForTagExpression) {
        this.forInData = forInData;
    }

    public setForNData(forNData: any) {
        this.forNData = forNData;
    }

    public setPresentState(presentState: VirtualTagNodePresentState): void {
        this.presentState = presentState;
    }

    public getPresentState(): VirtualTagNodePresentState {
        return this.presentState;
    }

    public buildNode(): Node {
        let node;

        if (this.getPresentState() === VirtualTagNodePresentState.Present) {
            node = document.createElement(this.parsedNode.name);
        }

        return node;
    }

    public renderIfNodeExists(): void {
        if (this.getBuildedNode()) {
            this.renderDynamicAndStaticAttributes();
            this.appendRenderedElement();
            this.storeBuildedNodes();
            this.extendChildVirtualElementsAndRender();
        }
    }

    public removeBuildedNodeFromDom(): void {
        const buildedNodes = this.getBuildedNodes();

        for (const buildedNode of buildedNodes) {
            if (buildedNode && buildedNode.element.parentNode) {
                buildedNode.element.parentNode.removeChild(buildedNode.element);
            }
        }

        this.buildedNodes = [];
    }

    public renderForOf(): void {
        if (this.forOfData) {
            const scope = this.getScope();

            for (const value of this.forOfData.value) {
                scope.setVariable(this.forOfData.newVariableName, value);
                this.renderFragment();
            }
        }
    }

    public renderForIn(): void {
        if (this.forInData) {
            const scope = this.getScope();

            if (Number.isInteger(this.forInData.value) && this.forInData.value > 0) {
                for (let i = 0; i < this.forInData.value; i++) {
                    scope.setVariable(this.forInData.newVariableName, i);
                    this.renderFragment();
                }
            } else {
                for (const value in this.forInData.value) {
                    if (this.forInData.value.hasOwnProperty(value)) {
                        scope.setVariable(this.forInData.newVariableName, value);
                        this.renderFragment();
                    }
                }
            }
        }
    }

    public renderForN(): void {
        if (this.forNData) {
            if (Number.isInteger(this.forNData) && this.forNData >= 0) {
                for (let i = 0; i < this.forNData; i++) {
                    this.renderFragment();
                }
            } else {
                console.warn(`@for only accept unsigned integer as single argument.`);
            }
        }
    }

    public updateForNData(updatedValue: any): void {
        if (updatedValue && Number.isInteger(updatedValue) && updatedValue >= 0) {
            const difference = Math.abs(this.forNData - updatedValue);

            console.log(updatedValue);
            if (this.forNData > updatedValue) {
                for (let i = this.forNData; i > updatedValue; i--) {
                    super.removeBuildedNodeFromDom(this.buildedNodes[i - 1].element);
                }
                this.buildedNodes.splice(updatedValue, difference);
                this.forNData = updatedValue;
            } else {
                // add
            }
        }
    }

    public getBuildedNodes(): IBuildedElement[] {
        return this.buildedNodes;
    }

    protected storeBuildedNodes(): void {
        const buildedNode = this.getBuildedNode();

        if (buildedNode) {
            this.buildedNodes.push({
                id: this.lastForId,
                element: buildedNode as Element,
            });
        }

        this.lastForId++;
    }

    protected renderFragment(): void {
        super.render();
        this.renderIfNodeExists();
    }

    protected renderAtShapedAttributes(): void {
        this.attributesManager.renderAtShapedAttributes();
    }

    protected renderDynamicAndStaticAttributes(): void {
        this.attributesManager.renderDynamicAndStaticAttributes();
    }
}
