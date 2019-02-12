import { Event } from '@fistache/shared'

export default class Hmr {
    public static getInstance(): Hmr {
        if (!Hmr.instance) {
            Hmr.instance = new Hmr()
        }

        return Hmr.instance
    }
    private static instance: Hmr

    private readonly data: any

    private constructor() {
        this.data = {}
    }

    public register(id: string, component: any): void {
        if (this.data.hasOwnProperty(id)) {
            return
        }

        this.bindEvents(id, component)
        this.data[id] = {
            components: []
        }
    }

    public rerender(id: string, options: any): void {
        this.handleRerender(() => {
            const data = this.data[id]
            this.bindEvents(id, options.script)

            if (data) {
                const redundantIndecies: number[] = []

                data.components.forEach((component: any) => {
                    const oldComponent = component

                    component = new options.script()
                    component.virtualNode = oldComponent.virtualNode
                    component.embeddedContent
                        = oldComponent.embeddedContent
                    component.element = oldComponent.element
                    component.initialized = oldComponent.initialized

                    redundantIndecies.push(
                        data.components.indexOf(oldComponent)
                    )
                    data.components.push(component)
                    component.rerender()
                })

                redundantIndecies.map((index: number) => {
                    data.components.splice(index, 1)
                })
            }
        })
    }

    private bindConstructor(id: string, options: any) {
        const data = this.data
        // do not use arrow function cause we need to bind a context
        this.addComponentEventHandler(
            options,
            Event.Created,
            function(this: any) {
                data[id].components.push(this)
            }
        )
        this.addComponentEventHandler(
            options,
            Event.Destroyed,
            function(this: any) {
                // todo: implement
            }
        )
    }

    private addComponentEventHandler(
        options: any,
        event: Event,
        handler: () => void
    ) {
        if (!options.events[event]) {
            options.events[event] = []
        }

        options.events[event].push(handler)
    }

    private handleRerender(rerender: () => void) {
        try {
            rerender()
        } catch (exception) {
            console.error(exception)
            console.warn(`Something went wrong during hot-reload. ` +
                             `Full reload required.`
            )
        }
    }

    private bindEvents(id: string, component: any) {
        component.prototype.__hmr = {
            events: []
        }

        this.bindConstructor(id, component.prototype.__hmr)
    }
}
