export interface ComponentAttributeInterface {
    getName(): string
}

export class ComponentAttribute implements ComponentAttributeInterface {
    constructor(private name: string) {
        //
    }

    public getName(): string {
        return this.name
    }
}
