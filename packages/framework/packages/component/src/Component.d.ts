import { ComponentAttribute } from "./ComponentAttribute";
export interface IComponent {
    getAttributes(): ComponentAttribute[];
}
export declare class Component implements IComponent {
    private attributes;
    getAttributes(): ComponentAttribute[];
}
