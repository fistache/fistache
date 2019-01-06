import { Component } from '@seafood/component'
import { HmrOptions } from './HmrOptions'
// import { Reactivity } from './Reactivity/Reactivity'

export class CompiledComponent {
    public rootElement: any
    public hmrOptions: HmrOptions
    public component: Component
    public renderer: any

    constructor(component: Component, renderer: any) {
        // Reactivity.applyComponent(component)

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
