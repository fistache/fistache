import {Component} from "@seafood/component";
import {IHmrOptions} from "./IHmrOptions";
import {Reactivity} from "./Reactivity/Reactivity";

export class CompiledComponent {
    public rootElement: any;
    public hmrOptions: IHmrOptions;
    public component: Component;
    public templateRenderer: any;

    constructor(component: Component, templateRenderer: any) {
        Reactivity.addReactivityToObtainableComponentFields(component);

        this.hmrOptions = {
            events: [],
        };
        this.component = component;
        this.templateRenderer = templateRenderer;
    }

    public render(element?: any): void {
        if (element) {
            this.rootElement = element;
        } else {
            this.clearContent();
            element = this.rootElement;
        }

        this.templateRenderer.renderTree(element, this.component);
    }

    public setComponent(component: Component): void {
        this.component = component;
    }

    public setTemplateRenderer(templateRenderer: any): void {
        this.templateRenderer = templateRenderer;
    }

    private clearContent() {
        while (this.rootElement.hasChildNodes()) {
            this.rootElement.removeChild(this.rootElement.lastChild);
        }
    }
}