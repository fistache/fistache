import _ from "lodash";
import {VirtualNode} from "./VirtualNodes/VirtualNode";

export class VirtualTree {
    public renderedElement: any;
    public childNodes: VirtualNode[];

    public constructor() {
        this.childNodes = [];
    }

    public addChildNode(node: VirtualNode) {
        this.childNodes.push(node);
    }

    public render(rootElement?: any): void {
        if (!rootElement) {
            throw new Error("Root element must be specified.");
        }

        this.renderedElement = rootElement;
        let stack = [rootElement];

        while (stack.length) {
            const virtualElement = stack.pop();
            const childNodes = _.slice(virtualElement.childNodes).reverse();
            virtualElement.render();
            stack = stack.concat(childNodes);
        }
    }
}
