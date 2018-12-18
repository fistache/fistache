import {VirtualNode} from "./VirtualNode";

export abstract class SingleVirtualNode extends VirtualNode {
    public render(): void {
        super.render();
        this.appendRenderedElement();
    }
}
