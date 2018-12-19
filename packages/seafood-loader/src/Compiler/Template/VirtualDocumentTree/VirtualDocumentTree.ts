import {ComponentScope} from "./DataBinding/ComponentScope";
import {VirtualElement} from "./VirtualElement";

export class VirtualDocumentTree extends VirtualElement {
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
        this.appendRenderedElement();
        this.extendChildVirtualElementsAndRender();
    }

    protected buildNode(): Node {
        const node = document.createElement("div");
        node.setAttribute("id", "app-tree");

        return node;
    }

    protected appendRenderedElement(): void {
        const buildedNode = this.getBuildedNode();

        if (this.parentNode && buildedNode) {
            this.parentNode.appendChild(buildedNode);
        }
    }
}
