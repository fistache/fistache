import { VirtualNode } from './VirtualNode'

// todo: redesign this class
export class VirtualEmbeddedContentNode extends VirtualNode {
    public makeNode(): Node {
        return document.createComment('embedded content')
    }
}
