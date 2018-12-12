import {VirtualTree} from "../VirtualTree";
import {ComplexVirtualNode} from "./ComplexVirtualNode";

export abstract class VirtualNode {
    public parsedElement: any;
    public renderedElement: any;
    public parent?: ComplexVirtualNode|VirtualTree;

    protected constructor(parent?: ComplexVirtualNode|VirtualTree) {
        if (parent) {
            this.parent = parent;
        }
    }

    public abstract render(): void;
}
