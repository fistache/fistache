import { CompiledComponent } from './CompiledComponent'

// todo: add node.js support

export class Router {
    private currentPage!: CompiledComponent

    private routes = new Map<string, () => any>()

    private readonly location: Location
    // private readonly sectors!: string[]

    constructor() {
        this.location = window.location
        // this.sectors = this.parseSectors()
    }

    public addRoutes(routes: any) {
        for (const routeBuilder of routes) {
            routeBuilder(this)
        }
    }

    public bind(path: string, componentPromise: () => any) {
        this.routes.set(path, componentPromise)
    }

    public async resolveRoute() {
        const componentPromise = this.routes.get(this.location.pathname)

        if (componentPromise) {
            this.currentPage = await componentPromise()
        }
    }

    public getCurrentPage(): CompiledComponent {
        // @ts-ignore
        return this.currentPage.default
    }

    // private parseSectors(): string[] {
    //     return this.location.pathname.split('/').slice(1)
    // }
}
