import {Component} from "../../component";
import {ComponentRenderer} from "./ComponentRenderer";

export class App {
    private renderer: ComponentRenderer;

    private rootComponent?: Component;

    constructor() {
        this.renderer = new ComponentRenderer();
    }

    public setRootComponent(component: Component) {
        this.rootComponent = component;
    }

    public run() {
        if (!this.rootComponent) {
            throw new Error("Root component must be specified.");
        }

        this.renderer.render(this.rootComponent);
    }
}
