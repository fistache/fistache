import { VirtualNode } from './VirtualNode'

export class VirtualCommentNode extends VirtualNode {
    public makeNode(): Node {
        return document.createComment(this.parsedData.data)
    }
}
