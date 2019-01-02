import {StaticAttribute} from "./StaticAttribute";

export abstract class NonStaticAttribute extends StaticAttribute {
    public getName(): string {
        return this.name.slice(1);
    }
}
