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
                    this.bindDynamicAttribute(attribName, attribs[attribName]);
                } else if (this.isItSystemAttribute(attribName)) {
                    this.bindSystemAttribute(attribName, attribs[attribName]);
                } else if (this.isItDynamicAndConditionalAttribute(attribName)) {
                    // todo: implement dynamic and conditional only for component attributes
                } else {
                    this.bindStaticAttribute(attribName, attribs[attribName]);
                }
            }
        }
    }

    protected isItDynamicAndConditionalAttribute(attribName: string): boolean {
        const regex = new RegExp(/^(@[a-zA-Z0-9_.-]+(?<!-))?(:[a-zA-Z0-9_.-]+(?<!-))?$/);
        return regex.test(attribName);
    }

    protected isItDynamicAttribute(attribName: string): boolean {
        const regex = new RegExp(/^(:[a-zA-Z0-9_.-]+(?<!-))$/);
        return regex.test(attribName);
    }

    protected isItSystemAttribute(attribName: string): boolean {
        const regex = new RegExp(/^(@[a-zA-Z0-9_.-]+(?<!-))$/);
        return regex.test(attribName);
    }

    protected resolveSystemAttributeState(name: string, value: string): void {
        console.log("system state", name, value);
    }

    protected bindSystemAttribute(name: string, value: string): void {
        console.log("system", name, value);
    }

    protected bindDynamicAttribute(name: string, value: string): void {
        console.log("dynamic", name, value);
    }

    protected bindStaticAttribute(name: string, value: string): void {
        console.log("static", name, value);
        this.renderedElement.setAttribute(name, value);
    }
}
