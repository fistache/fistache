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

export interface VirtualTagNodeForExpression {
    variableName: string;
    value: any;
}

export class VirtualTagNode extends VirtualNode {
    protected collection: Element[];

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
        super.beforeRender();
        this.attributesManager.initialize();
    }

    public render(): void {
        this.attributesManager.renderAtShapedAttributes();

        if (this.isPresent()) {
            this.renderSingleTag();
        }

        this.attributesManager.renderDynamicAndStaticAttributes();
    }

    public getBuildedNode(): Element | undefined | null {
        return super.getBuildedNode() as Element;
    }

    public useCollection(callback: (element: Element) => void): void {
        for (const element of this.collection) {
            callback(element);
        }
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
        }
    }

    public setPresentState(presentState: VirtualTagNodePresentState): void {
        this.presentState = presentState;
    }

    public getPresentState(): VirtualTagNodePresentState {
        return this.presentState;
    }

    protected renderSingleTag(): void {
        super.render();
        const buildedNode = this.getBuildedNode();

        if (buildedNode) {
            this.appendRenderedElement();
            this.extendChildVirtualElementsAndRender();

            this.collection.push(buildedNode);
        }
    }

    protected buildNode(): Element | undefined | null {
        return document.createElement(this.parsedNode.name);
    }

    private isPresent(): boolean {
        return this.getPresentState() === VirtualTagNodePresentState.Present;
    }
}
