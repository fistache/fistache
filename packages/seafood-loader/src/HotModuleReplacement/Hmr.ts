import {CompiledComponent, HmrOptions} from "@seafood/app";
import {Event} from "@seafood/component";
import {SeafoodLoader} from "../SeafoodLoader";

export default class Hmr {
    public static instance: Hmr;
    public static getInstance(): Hmr {
        if (!Hmr.instance) {
            Hmr.instance = new Hmr();
        }

        return Hmr.instance;
    }

    private readonly data: any;

    private constructor() {
        this.data = {};
    }

    // todo: change component type to CompiledComponent.
    public register(id: string, options: HmrOptions): void {
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
                    component.setTemplateRenderer(
                        options[SeafoodLoader.EXPORT_COMPILED_COMPONENT_INSTANCE].templateRenderer
                    );
                    component.setComponent(options[SeafoodLoader.EXPORT_COMPILED_COMPONENT_INSTANCE].component);
                    component.render();
                });
            }
        });
    }

    protected bindConstructor(id: string, options: HmrOptions) {
        const data = this.data;
        // do not use arrow function cause we need to bind a context for "this"
        this.addComponentEventHandler(options, Event.Created, function(this: any) {
            const hmrData = data[id];

            if (!hmrData.constructor) {
                hmrData.constructor = this.constructor;
            }

            hmrData.components.push(this);
        });
        this.addComponentEventHandler(options, Event.Destroyed, function(this: any) {
            // todo: implement
        });
    }

    protected addComponentEventHandler(options: HmrOptions, event: Event, handler: () => void) {
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
