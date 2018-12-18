import {Property} from "./Property";

export class ReactiveProperty extends Property {
    protected area: any;

    public constructor(name: string, value: any, area: any) {
        super(name, value);
        this.area = area;
    }

    public getArea(): any {
        return this.area;
    }
}
