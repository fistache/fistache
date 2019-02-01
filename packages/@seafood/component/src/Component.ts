import {
    AttributeProperties,
    DECORATOR_ATTRIBUTE_FLAG
} from './Decorators/Attribute'
import { unreactive } from './Decorators/Unreactive'
import { parseArgs } from './Decorators/Use'
import { ComponentAttributes } from './interfaces'
import { VirtualComponent } from './VirtualNode/VirtualComponent'
import { VirtualElement } from './VirtualNode/VirtualElement'
import { VirtualEmbeddedContent } from './VirtualNode/VirtualEmbeddedContent'
import { VirtualNode } from './VirtualNode/VirtualNode'
import { VirtualTextNode } from './VirtualNode/VirtualTextNode'

export enum Event {
    Created,
    Destroyed
}

export interface ComponentEventInterface {
    bindEvent(eventName: Event, callback: () => void): void

    fireEvent(eventName: Event): void
}

export const ComponentSymbol = Symbol('ComponentSymbol')
export const ParentComponentSymbol = Symbol('ParentComponentSymbol')
export const ParentRenderSymbol = Symbol('ParentRenderSymbol')

// todo: make a seperate class implemented render functionality
export class Component implements ComponentEventInterface {
    public static renderFragment(stack: VirtualNode[]) {
        while (stack.length) {
            const virtualNode = stack.pop() as VirtualNode

            virtualNode.render()

            // shouldRenderChildVirtualNodes instead of instanceof check
            // to improve performance
            if (virtualNode.shouldRenderChildVirtualNodes()) {
                // Get child nodes only after render because virtual
                // package can create a new one.
                const childVirtualNodes = (virtualNode as VirtualElement)
                    .getChildVirtualNodes().slice().reverse()

                stack.push(...childVirtualNodes)
            }
        }
    }

    @unreactive()
    protected attributes = new Map<string | symbol, AttributeProperties>()

    @unreactive()
    protected eventHandlers: Event[][] = []

    @unreactive()
    protected usedStuff?: Set<any>

    @unreactive()
    protected usedComponents?: Map<string, new () => Component>

    @unreactive()
    // tslint:disable-next-line: variable-name
    private __render!: (
        element: any,
        component: any,
        embeddedContent: any,
        text: any,
        include: any
    ) => VirtualNode
    private embeddedContent?: VirtualNode[]

    public render(element: Element, embeddedContent?: VirtualNode[]) {
        this.embeddedContent = embeddedContent

        const virtualNode = this.__render(
            this.renderElement,
            this.renderComponent,
            this.renderEmbeddedContent,
            this.renderText,
            this.resolveComponent
        )

        Component.renderFragment([virtualNode])

        const node = virtualNode.getNode()

        if (node) {
            element.appendChild(node)
        }
    }

    public setAttribute(this: any, name: string, value: any): void {
        if (this.attributes.has(name)) {
            // todo: add type checking in dev mode
            this[name] = value
        }
    }

    public checkRequeredAttributesExistance(this: any): void {
        // todo: disable for production
        for (const attribute of this.attributes) {
            if (attribute[1]!.required
                && this[attribute[0]] === null
                || this[attribute[0]] === undefined
            ) {
                throw new Error(
                    `Required attribute '${attribute[0]}' had not ` +
                    `been set.`
                )
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
            (this.eventHandlers as any)[eventName].forEach(
                (event: () => void) => {
                    event()
                }
            )
        }
    }

    public getUsedComponents(): Map<string, new () => Component> | undefined {
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
            const properties: AttributeProperties = Reflect.getMetadata(
                DECORATOR_ATTRIBUTE_FLAG, this, propertyKey
            )

            if (properties) {
                this.attributes.set(propertyKey, properties)
            }
        }
    }

    private renderElement = (
        element: string,
        attributes?: ComponentAttributes,
        children?: VirtualNode[]
    ): VirtualElement => {
        const virtualElement = new VirtualElement(element, attributes)

        if (children) {
            for (const child of children) {
                virtualElement.addChildVirtualNode(child)
                child.setParentVirtualElement(virtualElement)
            }
        }

        return virtualElement
    }

    private renderComponent = (
        component: Component,
        attributes?: ComponentAttributes,
        embeddedContent?: VirtualNode[]
    ): VirtualComponent => {
        return new VirtualComponent(component, attributes, embeddedContent)
    }

    private renderEmbeddedContent = () => {
        return new VirtualEmbeddedContent(this.embeddedContent)
    }

    private renderText = (expression: string): VirtualTextNode => {
        // todo: render if text is a root node
        return new VirtualTextNode(expression)
    }

    private resolveComponent = (name: string): Component => {
        if (name === 'parent') {
            try {
                const parent: any = Reflect.getPrototypeOf(
                    Reflect.getPrototypeOf(this)
                )
                return new parent.constructor()
            } catch (e) {
                this.throwComponentNotFoundException(name)
            }
        }

        if (!this.usedComponents) {
            return this.throwComponentNotFoundException(name)
        }

        const component = this.usedComponents.get(name)

        if (!component) {
            return this.throwComponentNotFoundException(name)
        }

        return new component()
    }

    private throwComponentNotFoundException(name: string): never {
        if (name === 'parent') {
            throw new Error(
                `Cannot find parent component template. ` +
                `Please make sure you are extending this component of a ` +
                `component with a template.`
            )
        } else {
            throw new Error(`Component with name '${name}' not found.`)
        }
    }
}
