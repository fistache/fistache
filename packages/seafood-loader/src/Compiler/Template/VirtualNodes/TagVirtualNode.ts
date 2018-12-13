import {ComplexVirtualNode} from "./ComplexVirtualNode";

export class TagVirtualNode extends ComplexVirtualNode {
    public constructor(element: any, parent?: ComplexVirtualNode) {
        super(parent);
        this.parsedElement = element;
    }

    public render(parsedElement: any) {
        const renderedElement = document.createElement(parsedElement.name);

        const attribs = parsedElement.attribs;
        for (const attribName in attribs) {
            if (attribs.hasOwnProperty(attribName)) {
                renderedElement.setAttribute(attribName, attribs[attribName]);
            }
        }

        return renderedElement;
    }
}
