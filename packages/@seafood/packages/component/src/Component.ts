import { CompiledComponent } from '@seafood/app'
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
    protected attributes: ComponentAttribute[] = []

    @unreactive()
    protected eventHandlers: Event[][] = []

    @unreactive()
    protected usedStuff?: Set<any>

    @unreactive()
    protected usedComponents?: Map<string, CompiledComponent>

    public getAttributes(): ComponentAttribute[] {
        return this.attributes
    }

    public bindEvent(eventName: Event, callback: () => void) {
        if (!this.eventHandlers.hasOwnProperty(eventName)) {
            this.eventHandlers[eventName] = []
        }

        (this.eventHandlers as any)[eventName].push(callback)
    }

    public unbindEvent(eventName: Event) {
        this.eventHandlers[eventName] = []
    }

    public fireEvent(eventName: Event) {
        if (this.eventHandlers.hasOwnProperty(eventName)) {
            (this.eventHandlers as any)[eventName].forEach((event: () => void) => {
                event()
            })
        }
    }

    public getUsedComponents(): Map<string, CompiledComponent> | undefined {
        return this.usedComponents
    }

    public clone() {
        return new (this.constructor as any)()
    }
}
