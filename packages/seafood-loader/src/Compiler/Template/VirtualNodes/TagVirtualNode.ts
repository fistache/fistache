import {ComplexVirtualNode} from "./ComplexVirtualNode";

export class TagVirtualNode extends ComplexVirtualNode {
    public constructor(element: any, parent?: ComplexVirtualNode) {
        super(parent);
        this.parsedElement = element;
    }

    public render(): void {
        this.renderedElement = document.createElement(this.parsedElement.name);

        this.renderAttributes();
    }

    protected renderAttributes(): void {
        const attribs = this.parsedElement.attribs;
        for (const attribName in attribs) {
            if (attribs.hasOwnProperty(attribName)) {
                if (this.isItDynamicAttribute(attribName)) {
                    if (this.isItConditionalAttribute(attribName)) {
                        this.resolveConditionalAttribute(attribName, attribs[attribName]);
                    } else {
                        this.bindDynamicAttribute(attribName, attribs[attribName]);
                    }
                } else {
                    this.bindStaticAttribute(attribName, attribs[attribName]);
                }
            }
        }
    }

    protected isItDynamicAttribute(attribName: string): boolean {
        const regex = new RegExp(/^(@[a-zA-Z0-9_.-]+(?<!-))?(:[a-zA-Z0-9_.-]+(?<!-))?$/);
        return regex.test(attribName);
    }

    protected isItConditionalAttribute(attribName: string): boolean {
        const regex = new RegExp(/^(@[a-zA-Z0-9_.-]+(?<!-))(:[a-zA-Z0-9_.-]+(?<!-))?$/);
        return regex.test(attribName);
    }

    protected resolveConditionalAttribute(name: string, value: string): void {
        console.log("conditional", name, value);
    }

    protected bindConditionalAttribute(name: string, value: string): void {
        //
    }

    protected bindDynamicAttribute(name: string, value: string): void {
        console.log("dynamic", name, value);
    }

    protected bindStaticAttribute(name: string, value: string): void {
        console.log("static", name, value);
        this.renderedElement.setAttribute(name, value);
    }
}
