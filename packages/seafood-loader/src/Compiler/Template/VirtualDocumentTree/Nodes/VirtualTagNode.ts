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

    protected buildedNodes: Element[];

    public constructor() {
        super();

        this.presentState = VirtualTagNodePresentState.Present;
        this.buildedNodes = [];
    }

    public render(): void {
        this.renderAtShapedAttributes();

        if (this.forOfData) {
            this.renderForOf();
        } else {
            this.renderFragment();
        }
    }

    public setForOfData(forOfData: IForTagExpression) {
        this.forOfData = forOfData;
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

            for (const value of Object.values(this.forOfData.value).reverse()) {
                scope.setVariable(this.forOfData.newVariableName, value);
                this.renderFragment();
                this.storeBuildedNodes();
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
        VirtualTagAttributesManager.renderAtShapedAttributes(this);
    }

    protected renderDynamicAndStaticAttributes(): void {
        VirtualTagAttributesManager.renderDynamicAndStaticAttributes(this);
    }
}
