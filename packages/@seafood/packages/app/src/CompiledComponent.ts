import { Component, Event } from '@seafood/component'
import Renderer from '../../../../seafood-loader/src/Compiler/Template/Renderer/Renderer'
// tslint:disable-next-line: max-line-length
import { VirtualComponent } from '../../../../seafood-loader/src/Compiler/Template/Renderer/VirtualElement/VirtualComponent'
import { HmrOptions } from './HmrOptions'

export class CompiledComponent {
    public rootElement: any
    public hmrOptions: HmrOptions
    public component: Component
    public renderer: Renderer
    public isItCompiledComponent = true
    public isItMaquetteComponent = false

    private virtualNode?: VirtualComponent
    private name?: string
    private initialized = false

    constructor(component: Component, renderer: any) {
        this.hmrOptions = {
            events: []
        }
        this.component = component
        this.renderer = renderer

        this.component.setAttributes()
    }

    public initialize() {
        if (!this.initialized) {
            this.renderer.prepare(this.component.getUsedComponents())
            this.initialized = true
        }
    }

    public beforeRender() {
        this.bindSystemEvents()
    }

    public render(element?: any, beforeChild?: any): Node | null | undefined {
        // todo: refactor
        if (this.isItMaquetteComponent) {
            return null
        }

        let node = null

        if (element) {
            this.rootElement = element
            node = this.renderer.render(this.rootElement, this.component, beforeChild)
            this.component.fireEvent(Event.Created)
        } else {
            this.component.fireEvent(Event.Destroyed)
            if (this.virtualNode) {
                this.virtualNode.rerender()
            } else {
                this.clearContent()
                this.renderer.render(this.rootElement, this.component)
            }
            this.component.fireEvent(Event.Created)
        }
        return node
    }

    public clone(): CompiledComponent {
        const compiledComponent = new CompiledComponent(
            this.component.clone(),
            this.renderer.clone()
        )

        compiledComponent.hmrOptions = this.hmrOptions
        compiledComponent.rootElement = this.rootElement
        compiledComponent.virtualNode = this.virtualNode
        compiledComponent.beforeRender()

        return compiledComponent
    }

    public getRenderer(): any {
        return this.renderer
    }

    public setName(name: string) {
        this.name = name
    }

    public getName(): string | undefined {
        return this.name
    }

    public getComponent(): Component {
        return this.component
    }

    public setComponent(component: Component): void {
        this.component = component
        this.component.setAttributes()
        // todo: too much clones created after hmr
    }

    public setTemplateRenderer(templateRenderer: any): void {
        this.renderer = templateRenderer
    }

    public setVirtualNode(virtualNode: VirtualComponent) {
        this.virtualNode = virtualNode
    }

    public deleteVirtualNode() {
        this.virtualNode = undefined
    }

    private clearContent() {
        while (this.rootElement.hasChildNodes()) {
            this.rootElement.removeChild(this.rootElement.lastChild)
        }
    }

    private bindSystemEvents() {
        const events = this.hmrOptions.events[Event.Created]
        this.component.unbindEvent(Event.Created)

        if (events && events.length) {
            this.component.bindEvent(Event.Created, events[0].bind(this))
        }
    }
}
