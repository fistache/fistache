import {SingleVirtualNode} from "../SingleVirtualNode";

export class VirtualTextNode extends SingleVirtualNode {
    protected buildNode(): Node {
        return document.createTextNode(this.parsedNode.data);
    }
}
