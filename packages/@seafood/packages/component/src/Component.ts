import { ComponentAttribute } from './ComponentAttribute'
import { unreactive } from './Decorators/Unreactive'

export enum Event {
    Created,
    Destroyed
}

export interface ComponentInterface {
    getAttributes(): ComponentAttribute[]
}

export interface ComponentEventInterface {
    bindEvent(eventName: Event, callback: () => void): void

    fireEvent(eventName: Event): void
}

export class Component implements ComponentInterface, ComponentEventInterface {
    @unreactive()
    private attributes: ComponentAttribute[] = []

    @unreactive()
    private readonly eventHandlers: Event[][]

    constructor() {
        this.eventHandlers = []
    }

    public getAttributes(): ComponentAttribute[] {
        return this.attributes
    }

    public bindEvent(eventName: Event, callback: () => void): void {
        if (!this.eventHandlers.hasOwnProperty(eventName)) {
            this.eventHandlers[eventName] = []
        }

        (this.eventHandlers as any)[eventName].push(callback)
    }

    public fireEvent(eventName: Event): void {
        if (this.eventHandlers.hasOwnProperty(eventName)) {
            (this.eventHandlers as any)[eventName].forEach((event: () => void) => {
                event()
            })
        }
    }
}
