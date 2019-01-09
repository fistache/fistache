import { Component } from '@seafood/component'
import { VirtualTree } from '../../../../seafood-loader/src/Compiler/Template/Renderer/VirtualElement/VirtualTree'
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
        this.renderer.prepare(this.component.getUsedComponents())
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
