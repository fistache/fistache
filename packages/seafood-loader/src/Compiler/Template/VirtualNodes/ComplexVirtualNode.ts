import {VirtualTree} from "../VirtualTree";
import {VirtualNode} from "./VirtualNode";

export abstract class ComplexVirtualNode extends VirtualNode {
    public childNodes: VirtualNode[];

    protected constructor(parent?: ComplexVirtualNode|VirtualTree) {
        super(parent);

        this.childNodes = [];
        if (this.parent) {
            this.parent.addChildNode(this);
        }
    }

    public addChildNode(node: VirtualNode) {
        this.childNodes.push(node);
    }
}
