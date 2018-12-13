import {CompiledComponent, IHmrOptions} from "@seafood/app";
import {Event} from "@seafood/component";

export default class Hmr {
    public static instance: Hmr;
    private readonly data: any;

    private constructor() {
        this.data = {};
    }

    public static getInstance(): Hmr {
        if (!Hmr.instance) {
            Hmr.instance = new Hmr();
        }

        return Hmr.instance;
    }

    // todo: change component type to CompiledComponent.
    public register(id: string, options: IHmrOptions): void {
        if (this.data.hasOwnProperty(id)) {
            return;
        }

        const constructor = null;
        this.bindConstructor(id, options);

        this.data[id] = {
            components: [],
            constructor,
            options,
        };
    }

    public rerender(id: string, options: any): void {
        this.handleRerender(() => {
            const data = this.data[id];
            if (data && data.constructor) {
                data.components.forEach((component: CompiledComponent) => {
                    component.setRenderer(options.component.renderer);
                    component.render();
                });
            }
        });
    }

    protected bindConstructor(id: string, options: IHmrOptions) {
        const data = this.data;
        // do not use arrow function cause we need to bind a context for "this"
        this.addComponentEventHandler(options, Event.Created, function (this: any) {
            const hmrData = data[id];

            if (!hmrData.constructor) {
                hmrData.constructor = this.constructor;
            }

            hmrData.components.push(this);
        });
        this.addComponentEventHandler(options, Event.Destroyed, function (this: any) {
            // todo: implement
        });
    }

    protected addComponentEventHandler(options: IHmrOptions, event: Event, handler: () => void) {
        if (!options.events[event]) {
            options.events[event] = [];
        }

        options.events[event].push(handler);
    }

    private handleRerender(rerender: () => void) {
        // try {
        rerender();
        // } catch (exception) {
        //     console.error(exception.message);
        //     console.error(exception.stackTrace);
        //     console.warn("Something went wrong during hot-reload. Full reload required.");
        // }
    }
}
