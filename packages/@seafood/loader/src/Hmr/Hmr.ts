import { Event } from '@seafood/shared'

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
                data.components.forEach((component: any) => {
                    component.__style = options.script.prototype.__style
                    component.__render = options.script.prototype.__render
                    component.usedComponents
                        = options.script.prototype.usedComponents
                    component.usedStuff
                        = options.script.prototype.usedStuff
                    component.rerender()
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
