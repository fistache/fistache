import { Component, Styler } from '@seafood/component'

export class App {
    private styler = new Styler()

    private rootComponent: Component

    constructor(rootComponent: Component) {
        this.rootComponent = rootComponent
    }

    public run(element: Element) {
        this.rootComponent.setStyler(this.styler)
        this.rootComponent.render(element)
    }
}
