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
    }

    public render(): void {
        this.buildedNode = this.buildNode();
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
        for (const virtualElement of this.childVirtualElements) {
            virtualElement.getScope().extend(this.getScope());
            virtualElement.render();
        }
    }

    protected abstract buildNode(): Node | undefined;

    protected abstract appendRenderedElement(): void;
}
