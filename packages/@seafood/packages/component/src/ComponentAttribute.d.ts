export interface IComponentAttribute {
    getName(): string;
}
export declare class ComponentAttribute implements IComponentAttribute {
    private name;
    constructor(name: string);
    getName(): string;
}
