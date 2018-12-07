import {ComponentAttribute} from "./ComponentAttribute";

export enum Event {
    Created,
    Destroyed,
}

export interface IComponent {
    getAttributes(): ComponentAttribute[];
}

export interface IComponentEvent {
    bindEvent(eventName: Event, callback: () => void): void;

    fireEvent(eventName: Event): void;
}

export class Component implements IComponent, IComponentEvent {
    private attributes: ComponentAttribute[] = [];

    private eventHandlers: Event[][];

    constructor() {
        this.eventHandlers = [];
    }

    public getAttributes(): ComponentAttribute[] {
        return this.attributes;
    }

    public bindEvent(eventName: Event, callback: () => void): void {
        if (!this.eventHandlers.hasOwnProperty(eventName)) {
            this.eventHandlers[eventName] = [];
        }

        (this.eventHandlers as any)[eventName].push(callback);
    }

    public fireEvent(eventName: Event): void {
        if (this.eventHandlers.hasOwnProperty(eventName)) {
            (this.eventHandlers as any)[eventName].forEach((event: () => void) => {
                event();
            });
        }
    }
}
