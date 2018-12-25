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

    protected buildedNodes: Element[];

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
            if (buildedNode && buildedNode.parentNode) {
                buildedNode.parentNode.removeChild(buildedNode);
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

            for (const value in this.forInData.value) {
                scope.setVariable(this.forInData.newVariableName, value);
                this.renderFragment();
            }
        }
    }

    public getBuildedNodes(): Element[] {
        return this.buildedNodes;
    }

    protected storeBuildedNodes(): void {
        const buildedNode = this.getBuildedNode();

        if (buildedNode) {
            this.buildedNodes.push(buildedNode as Element);
        }
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
