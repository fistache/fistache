import { CompiledComponent } from '@seafood/app'
import { AttributeProperties, DECORATOR_ATTRIBUTE_FLAG } from './Decorators/Attribute'
import { unreactive } from './Decorators/Unreactive'
import { parseArgs } from './Decorators/Use'

export enum Event {
    Created,
    Destroyed
}

export interface ComponentInterface {
    setAttribute(name: string, value: any): void

    checkRequeredAttributesExistance(): void
}

export interface ComponentEventInterface {
    bindEvent(eventName: Event, callback: () => void): void

    fireEvent(eventName: Event): void
}

export class Component implements ComponentInterface, ComponentEventInterface {
    @unreactive()
    protected attributes = new Map<string | symbol, AttributeProperties>()

    @unreactive()
    protected eventHandlers: Event[][] = []

    @unreactive()
    protected usedStuff?: Set<any>

    @unreactive()
    protected usedComponents?: Map<string, CompiledComponent>

    public setAttribute(this: any, name: string, value: any): void {
        if (this.attributes.has(name)) {
            // todo: add type checking in dev mode
            this[name] = value
        }
    }

    public checkRequeredAttributesExistance(this: any): void {
        // todo: disable for production
        for (const attribute of this.attributes) {
            if (attribute && attribute[1].required && this[attribute[0]] === null || this[attribute[0]] === undefined) {
                throw new Error(`Required attribute '${attribute[0]}' had not been set.`)
            }
        }
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

    public use(args: any) {
        const parsedArgs = parseArgs(args)

        if (this.usedComponents) {
            for (const item of parsedArgs.usedComponents) {
                this.usedComponents.set(item[0], item[1])
            }
        } else {
            this.usedComponents = parsedArgs.usedComponents
        }

        if (this.usedStuff) {
            for (const item of parsedArgs.usedStuff) {
                this.usedStuff.add(item)
            }
        } else {
            this.usedStuff = parsedArgs.usedStuff
        }
    }

    public clone() {
        const component = new (this.constructor as any)()

        component.usedStuff = this.usedStuff
        component.usedComponents = this.usedComponents

        return component
    }

    public setAttributes() {
        // tslint:disable-next-line: forin
        for (const propertyKey in this) {
            const properties: AttributeProperties = Reflect.getMetadata(DECORATOR_ATTRIBUTE_FLAG, this, propertyKey)
            if (properties) {
                this.attributes.set(propertyKey, properties)
            }
        }
    }
}
