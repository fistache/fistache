import {REACTIVE_PROPERTY_FLAG, ReactiveProperty} from "@seafood/app";
import {DECORATOR_UNREACTIVE_FLAG} from "@seafood/component";
import {VirtualTree} from "../VirtualTree";
import {ComplexVirtualNode} from "./ComplexVirtualNode";

export abstract class VirtualNode {
    public parsedElement: any;
    public renderedElement: any;
    public parent?: ComplexVirtualNode | VirtualTree;
    protected component: any;
    protected invisibleFragment: any;

    protected constructor(parent?: ComplexVirtualNode | VirtualTree) {
        if (parent) {
            this.parent = parent;
            this.parent.addChildNode(this);
        }
        this.createInvisibleFragment();
    }

    public abstract render(): void;

    public rerender() {
        if (this.parent) {
            const prevRenderedElement = this.renderedElement;

            this.render();

            console.log(this.renderedElement);
            if (this.renderedElement !== prevRenderedElement) {
                this.parent.renderedElement.replaceChild(this.renderedElement, prevRenderedElement);
                this.removeRenderedElement(prevRenderedElement);
            }
        } else {
            throw new Error("Parent element must be specified.");
        }
    }

    public append(): void {
        if (!this.parent) {
            throw new Error("Parent must be specified.");
        }

        if (this.renderedElement) {
            this.parent.renderedElement.appendChild(this.renderedElement);
        }
    }

    public renderAndAppend(component: any): void {
        this.component = component;
        this.addReactivity();
        this.render();
        this.append();
    }

    protected addReactivity() {
        //
    }

    protected createInvisibleFragment() {
        this.invisibleFragment = document.createDocumentFragment();
    }

    protected removeRenderedElement(renderedElement?: any): void {
        if (!renderedElement) {
            renderedElement = this.renderedElement;
        }

        if (renderedElement.parentNode) {
            renderedElement.parentNode.removeChild(renderedElement);
        }
    }

    protected removeRenderedElementChildNodes(renderedElement?: any) {
        if (!renderedElement) {
            renderedElement = this.renderedElement;
        }

        while (renderedElement.hasChildNodes()) {
            renderedElement.removeChild(renderedElement.lastChild);
        }
    }

    protected depend(obj: any, metadataProperty: any, callback: () => void) {
        const isObtainable = !Reflect.hasMetadata(DECORATOR_UNREACTIVE_FLAG, obj, metadataProperty);
        if (isObtainable) {
            const reactiveProperty: ReactiveProperty = Reflect.getMetadata(
                REACTIVE_PROPERTY_FLAG,
                obj,
                metadataProperty,
            );
            if (reactiveProperty) {
                reactiveProperty.depend(callback);
            } else {
                console.warn(`${metadataProperty} variable is not found.`);
            }
        }
    }

    protected resolveDependentVars(vars: string[], rerenderCallback: () => void) {
        vars.forEach((variable: string) => {
            const {obj, varName} = this.getComponentPropertyByVariableName(variable);
            this.depend(obj, varName, rerenderCallback);
        });
    }

    protected getComponentPropertyByVariableName(variable: string): any {
        const isObject = variable.includes(".");
        let obj = this.component;
        let varName: any = variable;

        if (isObject) {
            const nameParts = variable.split(".");
            varName = nameParts.pop();

            nameParts.forEach((vn: string) => {
                obj = obj[vn];
            });
        }

        return {
            obj,
            varName,
        };
    }
}
