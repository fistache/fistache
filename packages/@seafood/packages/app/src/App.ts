import { CompiledComponent } from './CompiledComponent'
import { Router } from './Router'

export class App {
    private readonly router: Router
    private rootComponent!: CompiledComponent
    private appComponent!: CompiledComponent

    constructor() {
        this.router = new Router()
    }

    public setRootComponent(component: CompiledComponent) {
        this.rootComponent = component
    }

    public setAppComponent(component: CompiledComponent) {
        this.appComponent = component
    }

    public getRouter() {
        return this.router
    }

    public async run() {
        await this.router.resolveRoute()
        const PageComponent = this.router.getCurrentPage()

        this.rootComponent.component.use({
            AppComponent: this.appComponent,
            PageComponent
        })
        this.rootComponent.initialize()
        this.rootComponent.render(document.getElementById('app'))
    }
}
