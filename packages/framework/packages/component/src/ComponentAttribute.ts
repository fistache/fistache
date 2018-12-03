export interface IComponentAttribute {
    getName(): string;
}

export class ComponentAttribute implements IComponentAttribute {
    constructor(private name: string) {
        //
    }

    public getName(): string {
        return this.name;
    }
}
