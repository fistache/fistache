import {VirtualTree} from "../VirtualTree";
import {ComplexVirtualNode} from "./ComplexVirtualNode";

export abstract class VirtualNode {
    public parsedElement: any;
    public renderedElement: any;
    public parent?: ComplexVirtualNode | VirtualTree;
    protected component: any;

    protected constructor(parent?: ComplexVirtualNode | VirtualTree) {
        if (parent) {
            this.parent = parent;
            this.parent.addChildNode(this);
        }
    }

    public abstract render(): void;

    public rerender() {
        if (this.parent) {
            const prevRenderedElement = this.renderedElement;

            this.render();
            this.parent.renderedElement.replaceChild(this.renderedElement, prevRenderedElement);
            this.removeRenderedElement(prevRenderedElement);
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

    protected removeRenderedElement(renderedElement: any) {
        if (!renderedElement) {
            renderedElement = this.renderedElement;
        }

        while (renderedElement.hasChildNodes()) {
            renderedElement.removeChild(renderedElement.lastChild);
        }
    }
}
