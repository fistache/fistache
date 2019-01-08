import { Component } from '@seafood/component'
import { HmrOptions } from './HmrOptions'

export class CompiledComponent {
    public rootElement: any
    public hmrOptions: HmrOptions
    public component: Component
    public renderer: any
    public isItCompiledComponent = true

    private name?: string

    constructor(component: Component, renderer: any) {
        this.hmrOptions = {
            events: []
        }
        this.component = component
        this.renderer = renderer
    }

    public render(element?: any): void {
        if (element) {
            this.rootElement = element
        } else {
            this.clearContent()
            element = this.rootElement
        }

        this.renderer.render(element, this.component)
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
    }

    public setTemplateRenderer(templateRenderer: any): void {
        this.renderer = templateRenderer
    }

    private clearContent() {
        while (this.rootElement.hasChildNodes()) {
            this.rootElement.removeChild(this.rootElement.lastChild)
        }
    }
}
