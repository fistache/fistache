import {VirtualNode} from "../VirtualNode";

export class VirtualEmbeddedContentNode extends VirtualNode {
    public render(): void {
        super.render();
        // this.attachBuildedNode();
    }

    protected buildNode(): Node | undefined {
        // console.log(this);
        return undefined;
    }
}
