import {ComponentAttribute} from "./ComponentAttribute";

export interface IComponent {
    getAttributes(): ComponentAttribute[];
}

export class Component implements IComponent {
    private attributes: ComponentAttribute[] = [];

    public getAttributes(): ComponentAttribute[] {
        return this.attributes;
    }
}
