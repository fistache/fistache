import {Scope} from "./DataBinding/Scope";

export abstract class VirtualElement {
    /**
     * A node in browser where buildedNode will append.
     */
    protected parentNode?: Node;

    /**
     * A node in browser created after rendering.
     */
    protected buildedNode?: Node | null;

    protected parentVirtualElement?: VirtualElement;

    protected nodesBeforeBuildedNode: Node[];

    /**
     * A property which the element will use to bind a data.
     */
    protected scope: Scope;

    /**
     * A virtual document tree or virtual nodes.
     */
    protected childVirtualElements: VirtualElement[];

    public constructor() {
        this.scope = new Scope();
        this.childVirtualElements = [];
        this.nodesBeforeBuildedNode = [];
    }

    public beforeRender(): void {
        this.rememberNodesBeforeBuildedNode();
    }

    public render(): void {
        this.buildedNode = this.buildNode();
    }

    public getPreviousSiblingNode(): Node | null {
        const parentVirtualElement = this.getParentVirtualElement();

        if (parentVirtualElement && this.nodesBeforeBuildedNode.length) {
            for (const previousSibling of this.nodesBeforeBuildedNode) {
                if (previousSibling.parentNode !== parentVirtualElement.getBuildedNode()) {
                    continue;
                }

                return previousSibling;
            }
        }

        return null;
    }

    public addChildVirtualElement(node: VirtualElement): void {
        this.childVirtualElements.push(node);
    }

    public setParentVirtualElement(parentVirtualElement: VirtualElement): void {
        this.parentVirtualElement = parentVirtualElement;
        this.parentVirtualElement.addChildVirtualElement(this);
    }

    public setParentNode(parentNode: Node): void {
        this.parentNode = parentNode;
    }

    public setBuildedNode(buildedNode: Node): void {
        this.buildedNode = buildedNode;
    }

    public getParentVirtualElement(): VirtualElement | undefined {
        return this.parentVirtualElement;
    }

    public getBuildedNode(): Node | undefined | null {
        return this.buildedNode;
    }

    public getParentNode(): Node | undefined | null {
        return this.parentNode;
    }

    public getScope(): Scope {
        return this.scope;
    }

    public removeBuildedNodeFromDom(): void {
        const buildedNode = this.getBuildedNode() as Element;

        if (buildedNode && buildedNode.parentNode) {
            buildedNode.parentNode.removeChild(buildedNode);
        }

        this.buildedNode = null;
    }

    protected extendChildVirtualElementsAndRender(): void {
        const scope = this.getScope();
        const componentScope = scope.getComponentScope();

        for (const virtualElement of this.childVirtualElements) {
            const childVirtualElementScope = virtualElement.getScope();
            childVirtualElementScope.setParentScope(scope);

            if (componentScope) {
                childVirtualElementScope.setComponentScope(componentScope);
            }

            virtualElement.beforeRender();
            virtualElement.render();
        }
    }

    protected rememberNodesBeforeBuildedNode(): void {
        const nodes: Node[] = [];
        let previousSibling;

        if (this.buildedNode) {
            previousSibling = this.buildedNode.previousSibling;
        } else {
            const parentVirtualElement = this.getParentVirtualElement();
            if (parentVirtualElement) {
                const parentVirtualElementBuildedNode = parentVirtualElement.getBuildedNode();
                if (parentVirtualElementBuildedNode) {
                    previousSibling = parentVirtualElementBuildedNode.lastChild;
                }
            }
        }

        while (previousSibling) {
            nodes.push(previousSibling);
            previousSibling = previousSibling.previousSibling;
        }

        this.nodesBeforeBuildedNode = nodes;
    }

    protected abstract buildNode(): Node | undefined | null;

    protected abstract appendRenderedElement(): void;
}
