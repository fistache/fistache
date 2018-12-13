import {ComplexVirtualNode} from "./ComplexVirtualNode";

export class EmbedContentVirtualNode extends ComplexVirtualNode {
    public constructor(element: any, parent?: ComplexVirtualNode) {
        super(parent);
        this.parsedElement = element;
    }

    public render() {
        return document.createElement("div");
    }
}
