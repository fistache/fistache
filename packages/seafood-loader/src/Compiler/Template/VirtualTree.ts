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

    public renderTree(rootElement: any): void {
        if (!rootElement) {
            throw new Error("Root element must be specified.");
        }

        this.renderedElement = rootElement;
        let stack = this.childNodes.slice();

        while (stack.length) {
            const virtualElement: any = stack.pop();
            const childNodes = virtualElement.childNodes ? virtualElement.childNodes.slice().reverse() : [];
            virtualElement.renderAndAppend();
            stack = stack.concat(childNodes);
        }
    }

    public render() {
        //
    }

    public append() {
        //
    }

    public renderAndAppend() {
        this.render();
        this.append();
    }
}
