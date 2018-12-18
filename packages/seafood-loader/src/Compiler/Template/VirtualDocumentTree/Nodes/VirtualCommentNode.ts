import {SingleVirtualNode} from "../SingleVirtualNode";

export class VirtualCommentNode extends SingleVirtualNode {
    protected buildNode(): Node {
        return document.createComment(this.parsedNode.data);
    }
}
