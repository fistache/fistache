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

export class VirtualTagNode extends VirtualNode {
    /**
     * Used for @if conditinal rendering.
     *
     * A virtual element should not to be rendered if state
     * is missing.
     */
    protected presentState: VirtualTagNodePresentState;

    public constructor() {
        super();

        this.presentState = VirtualTagNodePresentState.Present;
    }

    public render(): void {
        super.render();

        if (this.getBuildedNode()) {
            this.renderDynamicAndStaticAttributes();
            this.appendRenderedElement();
            this.extendChildVirtualElementsAndRender();
        }
    }

    public setPresentState(presentState: VirtualTagNodePresentState): void {
        this.presentState = presentState;
    }

    public getPresentState(): VirtualTagNodePresentState {
        return this.presentState;
    }

    protected buildNode(): Node {
        let node;

        this.renderAtShapedAttributes();

        if (this.getPresentState() === VirtualTagNodePresentState.Present) {
            node = document.createElement(this.parsedNode.name);
        }

        return node;
    }

    protected renderAtShapedAttributes(): void {
        VirtualTagAttributesManager.renderAtShapedAttributes(this);
    }

    protected renderDynamicAndStaticAttributes(): void {
        VirtualTagAttributesManager.renderDynamicAndStaticAttributes(this);
    }
}
