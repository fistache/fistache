import {VirtualTagNode} from "./VirtualTagNode";
import {VirtualTagAttributesManager} from "./VirtualTagNodeAttribute/VirtualTagAttributesManager";
import {VirtualTagNodeComplex} from "./VirtualTagNodeComplex";

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

export class VirtualTagNodeCollection extends VirtualTagNodeComplex {
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

    protected collection: VirtualTagNode[];

    private attributesManager: VirtualTagAttributesManager;

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
        this.renderAtShapedAttributes();

        // if (this.forOfData) {
        //     this.renderForOf();
        // } else if (this.forInData) {
        //     this.renderForIn();
        // } else if (this.forNData) {
        //     this.renderForN();
        // } else {
        this.renderSingleTag();
        // }
    }

    public buildNode(): Node | null | undefined {
        let node;
        //
        // if (this.getPresentState() === VirtualTagNodePresentState.Present) {
        //     // render nodes
        // }
        //
        return node;
    }

    public renderSingleTag(): void {
        //
    }

    public renderForOf(): void {
    //     if (this.forOfData) {
    //         const scope = this.getScope();
    //
    //         for (const value of this.forOfData.value) {
    //             scope.setVariable(this.forOfData.newVariableName, value);
    //             this.renderFragment();
    //         }
    //     }
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

    protected renderAtShapedAttributes(): void {
        this.attributesManager.renderAtShapedAttributes();
    }

    protected renderDynamicAndStaticAttributes(): void {
        this.attributesManager.renderDynamicAndStaticAttributes();
    }
}
