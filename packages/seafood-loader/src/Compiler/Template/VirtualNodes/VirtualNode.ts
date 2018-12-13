import {VirtualTree} from "../VirtualTree";
import {ComplexVirtualNode} from "./ComplexVirtualNode";

export abstract class VirtualNode {
    public parsedElement: any;
    public renderedElement: any;
    public parent?: ComplexVirtualNode | VirtualTree;
    public parentRenderedElementId?: string;

    protected constructor(parent?: ComplexVirtualNode | VirtualTree) {
        if (parent) {
            this.parent = parent;
            this.parent.addChildNode(this);
        }
    }

    public abstract render(parent: VirtualNode | VirtualTree, parsedElement: any): void;

    public renderAndAppend(parentRenderedElementId: string, parsedElementId: string) {
        const renderId = this.genarateId();
        const renderedElementId = this.genarateId();
        const renderFunction = `
            const ${renderId} = ${this.render.toString()}
            const ${renderedElementId} = ${renderId}(${parsedElementId});
            ${VirtualTree.RENDER_FUNCTION_APPEND_FUNCTION}(${parentRenderedElementId}, ${renderedElementId});
        `;

        return {
            renderFunction,
            renderedElementId,
        };
    }

    private genarateId(len: number = 20) {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (let i = 0; i < len; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }
}
