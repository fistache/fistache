import {VirtualNode} from "../VirtualNode";

export class VirtualTagNode extends VirtualNode {
    protected buildNode(): Element | undefined | null {
        return document.createElement(this.parsedNode.name);
    }
}
