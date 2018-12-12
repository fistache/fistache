import {ComplexVirtualNode} from "./ComplexVirtualNode";

export class TagVirtualNode extends ComplexVirtualNode {
    public constructor(element: any, parent?: ComplexVirtualNode) {
        super(parent);
        this.parsedElement = element;
    }

    public render(): void {
        this.renderedElement = document.createElement(this.parsedElement.name);

        const attribs = this.parsedElement.attribs;
        for (const attribName in attribs) {
            if (attribs.hasOwnProperty(attribName)) {
                this.renderedElement.setAttribute(attribName, attribs[attribName]);
            }
        }
    }
}
