import {Scope} from "../DataBinding/Scope";
import {VirtualTagAttributesManager} from "./Attributes/VirtualTagAttributesManager";
import {VirtualElementInterface} from "./VirtualElementInterface";

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

export interface VirtualTagNodeCollectionItem {
    element: Element;
    scope: Scope;
}

export class VirtualTagNodeCollection implements VirtualElementInterface {
    protected collection: VirtualTagNodeCollectionItem[];

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
            if (this.forOfExpression) {
                this.renderForOfExpression();
            } else {
                this.renderSingleTag();
            }
        }

        this.attributesManager.renderDynamicAndStaticAttributes();
    }

    public setForOfExpression(forOfExpression: VirtualTagNodeForExpression): void {
        this.forOfExpression = forOfExpression;
    }

    public useCollection(callback: (element: Element) => void): void {
        for (const item of this.collection) {
            callback(item.element);
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
        // const buildedNode = this.getBuildedNode();
        //
        // if (buildedNode) {
        //     this.appendRenderedElement();
        //     this.extendChildVirtualElementsAndRender();
        //
        //     const scope = this.createSimilarScope();
        //
        //     this.collection.push({
        //         element: buildedNode,
        //         scope,
        //     });
        // }
    }

    protected renderForOfExpression(): void {
        if (this.isPresent() && this.forOfExpression) {
            // for (const value of this.forOfExpression.value) {
            //     this.renderSingleTag();
            // }
        }
    }

    private isPresent(): boolean {
        return this.getPresentState() === VirtualTagNodePresentState.Present;
    }

    // private createSimilarScope(): Scope {
        // todo: make clone method in Scope class
        // const scope = this.getScope();
        // const parentScope = scope.getParentScope();
        // const componentScope = scope.getComponentScope();
        // const similarScope = new Scope();
        //
        // if (parentScope) {
        //     similarScope.setParentScope(parentScope);
        // }
        //
        // if (componentScope) {
        //     similarScope.setComponentScope(componentScope);
        // }
        //
        // return similarScope;
    // }
}
