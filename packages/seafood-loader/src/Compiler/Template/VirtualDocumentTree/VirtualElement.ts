import {Scope} from "./DataBinding/Scope";

/**
 * More details in presentState variable declaration in
 * VirtualElement class.
 */
enum VirtualElementPresentState {
    Present,
    Missing,
}

export abstract class VirtualElement {
    /**
     * A node in browser where buildedNode will append.
     */
    protected parentNode?: Node;

    /**
     * A node in browser created after rendering.
     */
    protected buildedNode?: Node;

    /**
     * Used for @if conditinal rendering.
     *
     * A virtual element should not to be rendered if state
     * is missing.
     */
    protected presentState: VirtualElementPresentState;

    protected parentVirtualElement?: VirtualElement;

    /**
     * A property which the element will use to bind a data.
     */
    protected scope: Scope;

    /**
     * A virtual document tree or virtual nodes.
     */
    protected virtualElements: VirtualElement[];

    protected constructor() {
        this.presentState = VirtualElementPresentState.Present;
        this.scope = new Scope();
        this.virtualElements = [];
    }

    public render(): void {
        this.buildedNode = this.buildNode();

        if (this.getPresentState() !== VirtualElementPresentState.Missing) {
            this.appendRenderedElement();

            for (const virtualElement of this.virtualElements) {
                virtualElement.scope.extend(this.getScope());
                virtualElement.render();
            }
        }
    }

    public addVirtualElement(node: VirtualElement): void {
        this.virtualElements.push(node);
    }

    public setParentNode(parentNode: Node): void {
        this.parentNode = parentNode;
    }

    public getParentVirtualElement(): VirtualElement | undefined {
        return this.parentVirtualElement;
    }

    public getPresentState(): VirtualElementPresentState {
        return this.presentState;
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

    protected abstract buildNode(): Node | undefined;

    protected appendRenderedElement() {
        if (this.parentVirtualElement) {
            const parentBuildedNode = this.parentVirtualElement.getBuildedNode();
            const renderedNode = this.getBuildedNode();

            if (parentBuildedNode && renderedNode) {
                parentBuildedNode.appendChild(renderedNode);
            }
        }
    }
}
