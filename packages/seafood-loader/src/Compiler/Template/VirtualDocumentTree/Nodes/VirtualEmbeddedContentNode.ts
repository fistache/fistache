import {VirtualNode} from "../VirtualNode";

export class VirtualEmbeddedContentNode extends VirtualNode {
    public render(): void {
        super.render();
        // this.appendRenderedElement();
    }

    protected buildNode(): Node | undefined {
        // console.log(this);
        return undefined;
    }
}
