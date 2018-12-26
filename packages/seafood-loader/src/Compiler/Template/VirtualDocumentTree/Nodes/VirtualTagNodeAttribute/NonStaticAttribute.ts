// import {ReactiveProperty} from "../../DataBinding/Property/ReactiveProperty";
import {VirtualTagNodeCollection} from "../VirtualTagNodeCollection";
import {StaticAttribute} from "./StaticAttribute";

export abstract class NonStaticAttribute extends StaticAttribute {
    // protected reactiveProperty: ReactiveProperty;

    public constructor(virtualTagNode: VirtualTagNodeCollection, name: string, value: string) {
        super(virtualTagNode, name, value);
        // this.reactiveProperty = new ReactiveProperty(virtualTagNode.getScope());
    }

    public getName(): string {
        return this.name.slice(1);
    }
}
