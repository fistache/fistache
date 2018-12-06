import {Component} from "../../component";

export class ComponentRenderer {
    public render(component: Component) {
        // @ts-ignore
        component.$render(document.getElementsByTagName("body")[0]);
    }
}
