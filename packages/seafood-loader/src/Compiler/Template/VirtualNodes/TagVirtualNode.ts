import {ComplexVirtualNode} from "./ComplexVirtualNode";

export class TagVirtualNode extends ComplexVirtualNode {
    public constructor(element: any, parent?: ComplexVirtualNode) {
        super(parent);
        this.parsedElement = element;
    }

    public render(): void {
        this.renderSystemAttributes();

        if (this.renderedElement !== this.invisibleFragment) {
            this.renderedElement = document.createElement(this.parsedElement.name);

            this.renderAttributes();
        }
    }

    protected addReactivity() {
        const attribs = this.parsedElement.attribs;
        for (const attribName in attribs) {
            if (attribs.hasOwnProperty(attribName)) {
                this.addReactivityToAttribute(attribName, attribs[attribName]);
            }
        }
    }

    protected renderAttributes(): void {
        const attribs = this.parsedElement.attribs;
        for (const attribName in attribs) {
            if (attribs.hasOwnProperty(attribName)) {
                this.renderAttribute(attribName, attribs[attribName]);
            }
        }
    }

    protected renderAttribute(name: string, value: string) {
        if (this.isItDynamicAttribute(name)) {
            this.bindDynamicAttribute(name, value);
        } else if (
            !this.isItSystemAttribute(name) &&
            !this.isItDynamicAndConditionalAttribute(name)
        ) {
            this.bindStaticAttribute(name, value);
        }
    }

    protected renderSystemAttributes() {
        const attribs = this.parsedElement.attribs;
        for (const attribName in attribs) {
            if (attribs.hasOwnProperty(attribName)) {
                if (this.isItSystemAttribute(attribName)) {
                    this.bindSystemAttribute(attribName, attribs[attribName]);
                } else if (this.isItDynamicAndConditionalAttribute(attribName)) {
                    this.bindDynamicAndConditionalAttribute(attribName, attribs[attribName]);
                }
            }
        }
    }

    protected addReactivityToAttribute(name: string, value: string) {
        if (this.isItDynamicAttribute(name)) {
            this.resolveDependentVars([value], () => {
                this.renderAttribute(name, value);
            });
        } else if (this.isItSystemAttribute(name) ||
            this.isItDynamicAndConditionalAttribute(name)
        ) {
            this.resolveDependentVars([value], () => {
                this.rerender();
            });
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

    protected bindDynamicAndConditionalAttribute(name: string, value: string): void {
        // @if:products="products"
        // @if:products
    }

    protected bindSystemAttribute(name: string, value: string): void {
        switch (name) {
            case("@if"):
                this.bindIfSystemAttribute(value);
                break;
        }
        // console.log("system", name, value);
    }

    protected bindIfSystemAttribute(value: string): void {
        const property = this.getComponentPropertyByVariableName(value);
        const realValue = property.obj[property.varName];
        if (realValue) {
            this.renderedElement = null;
        } else {
            this.renderedElement = this.invisibleFragment;
        }
    }

    protected bindDynamicAttribute(name: string, value: string): void {
        const realName = this.getRealNameOfDynamicAttribute(name);
        const property = this.getComponentPropertyByVariableName(value);

        this.bindStaticAttribute(realName, property.obj[property.varName]);
    }

    protected bindStaticAttribute(name: string, value: string): void {
        this.renderedElement.setAttribute(name, value);
    }

    protected getRealNameOfDynamicAttribute(name: string): string {
        return name.slice(1);
    }
}
