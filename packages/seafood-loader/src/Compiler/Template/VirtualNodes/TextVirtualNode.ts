import {ComplexVirtualNode} from "./ComplexVirtualNode";
import {VirtualNode} from "./VirtualNode";

export class TextVirtualNode extends VirtualNode {
    public constructor(element: any, parent?: ComplexVirtualNode) {
        super(parent);
        this.parsedElement = element;
    }

    public render(): void {
        this.renderedElement = document.createTextNode(this.parsedElement.data);
    }
}
