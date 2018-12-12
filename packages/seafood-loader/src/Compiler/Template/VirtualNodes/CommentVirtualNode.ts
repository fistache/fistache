import {ComplexVirtualNode} from "./ComplexVirtualNode";
import {VirtualNode} from "./VirtualNode";

export class CommentVirtualNode extends VirtualNode {
    public constructor(element: any, parent?: ComplexVirtualNode) {
        super(parent);
        this.parsedElement = element;
    }

    public render(): void {
        // do not render comment
    }
}
