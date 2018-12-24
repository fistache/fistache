import {VirtualTagNode} from "../VirtualTagNode";

export abstract class Attribute {
    protected virtualTagNode: VirtualTagNode;

    protected name: string;

    protected value: string;

    public constructor(virtualTagNode: VirtualTagNode, name: string, value: string) {
        this.virtualTagNode = virtualTagNode;
        this.name = name;
        this.value = value.trim();
    }

    public abstract getName(): string;

    public abstract append(): void;

    public getVirtualTagNode(): VirtualTagNode {
        return this.virtualTagNode;
    }
}
