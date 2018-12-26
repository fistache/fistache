import {VirtualTagNodeCollection} from "../VirtualTagNodeCollection";

export abstract class Attribute {
    protected virtualTagNode: VirtualTagNodeCollection;

    protected name: string;

    protected value: string;

    public constructor(virtualTagNode: VirtualTagNodeCollection, name: string, value: string) {
        this.virtualTagNode = virtualTagNode;
        this.name = name;
        this.value = value.trim();
    }

    public abstract getName(): string;

    public abstract append(): void;

    public getVirtualTagNode(): VirtualTagNodeCollection {
        return this.virtualTagNode;
    }
}
