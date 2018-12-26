import {VirtualTagNode} from "../VirtualTagNode";
import {StaticAttribute} from "./StaticAttribute";

export abstract class NonStaticAttribute extends StaticAttribute {
    // protected reactiveProperty: ReactiveProperty;

    public constructor(virtualTagNode: VirtualTagNode, name: string, value: string) {
        super(virtualTagNode, name, value);
        // this.reactiveProperty = new ReactiveProperty(collection.getScope());
    }

    public getName(): string {
        return this.name.slice(1);
    }
}
