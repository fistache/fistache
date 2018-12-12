import {CompiledComponent} from "./CompiledComponent";
import {ComponentRenderer} from "./ComponentRenderer";

export class App {
    private renderer: ComponentRenderer;

    private rootComponent?: CompiledComponent;

    constructor() {
        this.renderer = new ComponentRenderer();
    }

    public setRootComponent(component: CompiledComponent) {
        this.rootComponent = component;
    }

    public run() {
        if (!this.rootComponent) {
            throw new Error("Root component must be specified.");
        }

        this.renderer.render(this.rootComponent);
    }
}
