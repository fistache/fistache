import {VirtualTagNode} from "../Nodes/VirtualTagNode";

export abstract class Attribute {
    protected collection: VirtualTagNode;

    protected name: string;

    protected value: string;

    public constructor(virtualTagNode: VirtualTagNode, name: string, value: string) {
        this.collection = virtualTagNode;
        this.name = name;
        this.value = value.trim();
    }

    public abstract getName(): string;

    public abstract append(): void;

    public getCollection(): VirtualTagNode {
        return this.collection;
    }
}
