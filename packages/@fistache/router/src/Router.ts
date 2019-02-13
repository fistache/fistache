import {Page} from '@fistache/component'

export class Router {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new Router()
        }

        return this.instance
    }
    private static instance: Router

    private routes = new Map<string, () => Promise<any>>()
    private currentPage!: Page
    private doneCallback?: () => void

    public bind(url: string, promise: () => Promise<any>) {
        this.routes.set(url, promise)
    }

    public getCurrentPage(): Page {
        return this.currentPage
    }

    public async resolveCurrentPage() {
        const promise = this.routes.get(this.getUrl())

        if (promise) {
            const result = await promise()
            this.currentPage = result.default
        } else {
            // set currentPage as 404
        }

        this.callDoneCallbackIfExists()
    }

    public getUrl(): string {
        // todo: refactor
        return window.location.pathname
    }

    public done(callback: () => void) {
        this.doneCallback = callback
        this.resolveCurrentPage()
    }

    public addRoutes(routes: Array<(router: Router) => void>) {
        for (const route of routes) {
            route(this)
        }
    }

    private callDoneCallbackIfExists() {
        if (this.doneCallback) {
            this.doneCallback()
        }
    }
}

export const router = Router.getInstance()
