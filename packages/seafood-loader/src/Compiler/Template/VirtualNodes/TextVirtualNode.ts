import {ComplexVirtualNode} from "./ComplexVirtualNode";
import {VirtualNode} from "./VirtualNode";

export class TextVirtualNode extends VirtualNode {
    public constructor(element: any, parent?: ComplexVirtualNode) {
        super(parent);
        this.parsedElement = element;
    }

    public render(component: any): void {
        const text = this.injectVartiables(this.parsedElement.data, component);
        this.renderedElement = document.createTextNode(text);
    }

    private injectVartiables(text: string, component: any): string {
        const regexp = new RegExp("{{(.|\\n)*?}}", "gm");
        return text.replace(regexp, (expression: string): string => {
            const varName = expression.slice(2, -2).trim();
            return component[varName];
        });
    }
}
