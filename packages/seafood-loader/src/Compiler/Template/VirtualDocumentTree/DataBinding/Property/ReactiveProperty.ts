import {Property} from "./Property";

export class ReactiveProperty extends Property {
    protected rerenderFunction?: () => void;

    protected area: any;

    public constructor(name: string, value: any, area: any) {
        super(name, value);
        this.area = area;
    }

    public getArea(): any {
        return this.area;
    }

    public setRerenderFunction(rerenderFunction: () => void): void {
        this.rerenderFunction = rerenderFunction;
    }

    public getRerenderFunction(): (() => void) | undefined {
        return this.rerenderFunction;
    }
}
