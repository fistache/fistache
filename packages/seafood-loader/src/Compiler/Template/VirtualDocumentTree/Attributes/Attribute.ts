import {VirtualTagNodeCollection} from "../VirtualTagNodeCollection";

export abstract class Attribute {
    protected collection: VirtualTagNodeCollection;

    protected name: string;

    protected value: string;

    public constructor(virtualTagNode: VirtualTagNodeCollection, name: string, value: string) {
        this.collection = virtualTagNode;
        this.name = name;
        this.value = value.trim();
    }

    public abstract getName(): string;

    public abstract append(): void;

    public getCollection(): VirtualTagNodeCollection {
        return this.collection;
    }
}
