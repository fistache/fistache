export class Property {
    protected name: string;

    protected value: any;

    public constructor(name: string, value: any) {
        this.name = name;
        this.value = value;
    }

    public getName(): string {
        return this.name;
    }

    public getValue(): any {
        return this.value;
    }
}
