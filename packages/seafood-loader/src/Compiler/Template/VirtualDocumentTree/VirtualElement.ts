import {Scope} from "./DataBinding/Scope";

export abstract class VirtualElement {
    /**
     * A node in browser where buildedNode will append.
     */
    protected parentNode?: Node;

    /**
     * A node in browser created after rendering.
     */
    protected buildedNode?: Node;

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

    public render(): void {
        this.rememberNodesBeforeBuildedNode();
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

    public getParentVirtualElement(): VirtualElement | undefined {
        return this.parentVirtualElement;
    }

    public getBuildedNode(): Node | undefined {
        return this.buildedNode;
    }

    public getParentNode(): Node | undefined {
        return this.parentNode;
    }

    public getScope(): Scope {
        return this.scope;
    }

    protected extendChildVirtualElementsAndRender(): void {
        const componentScope = this.getScope().getComponentScope();

        for (const virtualElement of this.childVirtualElements) {
            if (componentScope) {
                virtualElement.getScope().setComponentScope(componentScope);
            }

            virtualElement.render();
        }
    }

    protected removeBuildedNodeFromDom(): void {
        const buildedNode = this.getBuildedNode();

        if (buildedNode && buildedNode.parentNode) {
            buildedNode.parentNode.removeChild(buildedNode);
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

        this.nodesBeforeBuildedNode = nodes.reverse();
    }

    protected abstract buildNode(): Node | undefined;

    protected abstract appendRenderedElement(): void;
}
