import {Scope} from "@seafood/app";
import {VirtualElementInterface} from "./VirtualElementInterface";

export abstract class VirtualElement implements VirtualElementInterface {
    /**
     * A node in browser where buildedNode will append.
     */
    protected parentNode?: Node;

    protected parsedNode: any;

    /**
     * A node in browser created after rendering.
     */
    protected buildedNode?: Node | null;

    protected parentVirtualElement?: VirtualElement;

    protected position?: number;

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

    public beforeRender(): void {
        //
    }

    public abstract render(): void;

    public abstract attachBuildedNode(): void;

    public setParsedNode(parsedNode: any): void {
        this.parsedNode = parsedNode;
    }

    public getParsedNode(): any {
        return this.parsedNode;
    }

    public getChildVirtualElements(): VirtualElement[] {
        return this.childVirtualElements;
    }

    public getChildVirtualElementsReversed(): VirtualElement[] {
        const elements: VirtualElement[] = [];

        for (let i = this.childVirtualElements.length - 1; i > 0; i--) {
            elements.push(this.childVirtualElements[i]);
        }

        return elements;
    }

    public addChildVirtualElement(node: VirtualElement): void {
        this.childVirtualElements.push(node);
    }

    public setParentVirtualElement(parentVirtualElement: VirtualElement): void {
        this.parentVirtualElement = parentVirtualElement;
    }

    public setParentVirtualElementAndAddThisAsChild(parentVirtualElement: VirtualElement): void {
        this.setParentVirtualElement(parentVirtualElement);

        if (this.parentVirtualElement) {
            this.parentVirtualElement.addChildVirtualElement(this);
        }
    }

    public setChildVirtualElements(childVirtualElements: VirtualElement[]): void {
        this.childVirtualElements = childVirtualElements;
    }

    public setPosition(position: number): void {
        this.position = position;
    }

    public getPosition(): number | undefined {
        return this.position;
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

    public removeBuildedNode(): void {
        this.detachBuildedNode();
        this.parentNode = undefined;
        this.buildedNode = null;
    }

    public removeBuildedNodeAndDependencies(): void {
        this.getScope().removeDependents();

        for (const childVirtualElement of this.childVirtualElements) {
            childVirtualElement.removeBuildedNodeAndDependencies();
            this.removeChildVirtualElement(childVirtualElement);
        }


        if (this.parentVirtualElement) {
            this.parentVirtualElement.removeChildVirtualElement(this);
            this.parentVirtualElement = undefined;
        }

        this.childVirtualElements = [];
        this.removeBuildedNode();
    }

    public removeChildVirtualElement(virtualElement: VirtualElement): void {
        const index = this.childVirtualElements.indexOf(virtualElement);
        if (index !== -1) {
            this.childVirtualElements[index].getScope().removeDependents();
            this.childVirtualElements[index].parentVirtualElement = undefined;
            this.childVirtualElements.splice(
                index,
                1,
            );
        }
    }

    public detachBuildedNode(): void {
        const buildedNode = this.getBuildedNode() as Element;

        if (buildedNode && buildedNode.parentNode) {
            buildedNode.parentNode.removeChild(buildedNode);
        }
    }

    public clone(): VirtualElement {
        // todo: add all fields
        // @ts-ignore
        const cloned = new this.constructor();
        const childVirtualElements: VirtualElement[] = [];

        for (const childVirtualElement of this.getChildVirtualElements()) {
            childVirtualElements.push(childVirtualElement.clone());
        }

        cloned.setParsedNode(this.getParsedNode());
        cloned.setParentVirtualElement(this.getParentVirtualElement());
        cloned.setChildVirtualElements(childVirtualElements);

        return cloned;
    }

    protected extendChildVirtualElementsAndRender(): void {
        const scope = this.getScope();
        let position = 0;

        for (const virtualElement of this.childVirtualElements) {
            const childVirtualElementScope = virtualElement.getScope();
            childVirtualElementScope.setParentScope(scope);
            childVirtualElementScope.setContext(scope.getContext());

            virtualElement.setPosition(position);
            virtualElement.beforeRender();
            virtualElement.render();

            position++;
        }
    }
}
