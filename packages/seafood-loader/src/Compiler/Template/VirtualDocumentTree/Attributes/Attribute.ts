import {VirtualTagNodeCollection} from "../VirtualTagNodeCollection";

export abstract class Attribute {
    protected collection: VirtualTagNodeCollection;

    protected name: string;

    protected value: string;

    public constructor(virtualTagNodeCollection: VirtualTagNodeCollection, name: string, value: string) {
        this.collection = virtualTagNodeCollection;
        this.name = name;
        this.value = value.trim();
    }

    public abstract getName(): string;

    public abstract append(): void;

    public getCollection(): VirtualTagNodeCollection {
        return this.collection;
    }
}
