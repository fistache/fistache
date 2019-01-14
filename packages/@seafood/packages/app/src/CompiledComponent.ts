import { Component, Event } from '@seafood/component'
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

    public beforeRender() {
        this.bindSystemEvents()
    }

    public render(element?: any): void {
        if (element) {
            this.rootElement = element
        } else {
            this.component.fireEvent(Event.Destroyed)
            this.clearContent()
        }

        this.rerender()
    }

    public rerender() {
        this.renderer.render(this.rootElement, this.component)
        this.component.fireEvent(Event.Created)
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

    private bindSystemEvents() {
        const handleCreatedEvents = this.hmrOptions.events[Event.Created]
        console.log(this.component, handleCreatedEvents)
        if (Array.isArray(handleCreatedEvents)) {
            handleCreatedEvents.forEach((event: () => void) => {
                this.component.bindEvent(Event.Created, event.bind(this))
            })
        }
    }
}
