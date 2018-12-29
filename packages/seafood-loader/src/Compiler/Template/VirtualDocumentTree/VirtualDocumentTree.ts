import {ComponentScope} from "../DataBinding/ComponentScope";
import {VirtualNode} from "./VirtualNode";

export class VirtualDocumentTree extends VirtualNode {
    protected componentScope: ComponentScope;

    constructor() {
        super();
        this.componentScope = new ComponentScope();
        this.scope.setComponentScope(this.componentScope);
    }

    public getComponentScope(): ComponentScope {
        return this.componentScope;
    }

    public render(): void {
        this.componentScope.bindNormalizedProperties();
        super.render();
        this.attachBuildedNode();
        this.extendChildVirtualElementsAndRender();
    }

    public attachBuildedNode(): void {
        const buildedNode = this.getBuildedNode();

        if (this.parentNode && buildedNode) {
            this.parentNode.appendChild(buildedNode);
        }
    }

    protected buildNode(): Node {
        const node = document.createElement("div");
        node.setAttribute("id", "app-tree");

        return node;
    }
}
