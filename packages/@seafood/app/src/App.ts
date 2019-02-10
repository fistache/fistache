import { Component, Styler } from '@seafood/component'

export class App {
    public shouldUseStyles = false

    private styler = new Styler()

    private rootComponent: Component

    constructor(rootComponent: Component) {
        this.rootComponent = rootComponent
    }

    public run(element: Element) {
        this.configuteStyles()
        this.rootComponent.render(element)
    }

    public replace(element: Element) {
        this.configuteStyles()
        this.rootComponent.replace(element)
    }

    public useStyles() {
        this.shouldUseStyles = true
    }

    private configuteStyles() {
        if (this.shouldUseStyles) {
            this.rootComponent.enableStyles()
        }

        this.rootComponent.setStyler(this.styler)
    }
}
