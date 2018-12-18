import {VirtualNode} from "../VirtualNode";

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

        if (this.getPresentState() !== VirtualTagNodePresentState.Missing) {
            this.appendRenderedElement();
            this.extendChildVirtualElementsAndRender();
        }
    }

    public getPresentState(): VirtualTagNodePresentState {
        return this.presentState;
    }

    protected buildNode(): Node {
        let node;

        // render @-types attributes

        if (this.getPresentState() === VirtualTagNodePresentState.Present) {
            node = document.createElement(this.parsedNode.name);
        } else {
            node = document.createDocumentFragment();
        }

        return node;
    }
}
