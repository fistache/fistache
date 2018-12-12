import {ComplexVirtualNode} from "./ComplexVirtualNode";

export class ComponentVirtualNode extends ComplexVirtualNode {
    public constructor(element: any, parent?: ComplexVirtualNode) {
        super(parent);
        this.parsedElement = element;
    }

    public render(): void {
        const parentElement = this.parent && this.parent.renderedElement;

        if (!parentElement) {
            throw new Error("Parent element must be specified.");
        }

        // this.renderedElement.appendChild();
    }
}
