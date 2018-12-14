import {VirtualTree} from "../VirtualTree";
import {ComplexVirtualNode} from "./ComplexVirtualNode";

export abstract class VirtualNode {
    public parsedElement: any;
    public renderedElement: any;
    public parent?: ComplexVirtualNode | VirtualTree;

    protected constructor(parent?: ComplexVirtualNode | VirtualTree) {
        if (parent) {
            this.parent = parent;
            this.parent.addChildNode(this);
        }
    }

    public abstract render(component: any): void;

    public append(): void {
        if (!this.parent) {
            throw new Error("Parent must be specified.");
        }

        if (this.renderedElement) {
            this.parent.renderedElement.appendChild(this.renderedElement);
        }
    }

    public renderAndAppend(component: any): void {
        this.render(component);
        this.append();
    }
}
