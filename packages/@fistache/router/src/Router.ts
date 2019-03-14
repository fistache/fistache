import {Page} from '@fistache/component'

interface RouteVars {
    [key: string]: string
}

interface RouteResolveResult {
    promise: () => Promise<any>
    vars: RouteVars
}

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
    private notFoundPage?: Page
    private routeVars = {}

    private doneCallback?: () => void

    public bind(url: string, promise: () => Promise<any>) {
        this.routes.set(url, promise)
    }

    public getCurrentPage(): Page {
        return this.currentPage
    }

    public setNotFoundPage(component: any) {
        this.notFoundPage = component
    }

    public async resolveCurrentPage() {
        const result = this.resolve()
        this.routeVars = {}

        if (result) {
            this.routeVars = result.vars
            const page = await result.promise()
            this.currentPage = page.default
        } else if (this.notFoundPage) {
            this.currentPage = this.notFoundPage
        } else {
            throw new Error(`Something went wrong... 404 error page is `
                    + `not specified.`)
        }
    }

    public getUrl(): string {
        // todo: refactor !! note node SSR
        return window.location.pathname
    }

    public async done(callback: () => void) {
        this.doneCallback = callback
        await this.resolveCurrentPage()
        this.callDoneCallbackIfExists()
    }

    public addRoutes(routes: Array<(router: Router) => void>) {
        for (const route of routes) {
            route(this)
        }
    }

    public async fetchCurrentPage() {
        // @ts-ignore
        window.FISTACHE_FETCH = null

        if (this.currentPage) {
            let result

            if (!('fetch' in this.currentPage)) {
                throw new Error(`Page doesn't have fetch method. ` +
                    `Please make sure your component extends of Page class.`
                )
            }

            try {
                // @ts-ignore
                result = await this.currentPage.fetch(this.routeVars)
            } catch (e) {
                console.error(`Error during fetching.`)
                throw e
            }

            // @ts-ignore
            window.FISTACHE_FETCH = JSON.stringify(result)
        }
    }

    private callDoneCallbackIfExists() {
        if (this.doneCallback) {
            this.doneCallback()
        }
    }

    private resolve(): false | RouteResolveResult {
        const urlSections = this.getUrl().split('/')

        for (const route of this.routes) {
            const vars = {}
            if (this.isRouteMatchUrl(route[0], urlSections, vars)) {
                return {
                    promise: route[1],
                    vars
                }
            }
        }

        return false
    }

    private isRouteMatchUrl(
        routeUrl: string,
        urlSections: string[],
        vars: RouteVars
    ): boolean {
        const routeSections = routeUrl.split('/')

        if (routeSections.length !== urlSections.length) {
            return false
        }

        let match = true
        for (let i = 0; i < urlSections.length; i++) {
            const urlSector = urlSections[i]
            const routeSector = routeSections[i]

            if (!this.isUrlSectorsMatch(urlSector, routeSector, vars)) {
                match = false
                break
            }
        }

        return match
    }

    private isUrlSectorsMatch(
        urlSector: string,
        routeSector: string,
        vars: RouteVars
    ): boolean {
        let varDefUsed = false
        let result
        let lastIndex = 0
        const varDefRegEx = new RegExp('{(.*?)}', 'g')
        const splitters: string[] = []
        const varNames: string[] = []

        // tslint:disable-next-line
        while((result = varDefRegEx.exec(routeSector)) !== null) {
            const varName = result[1].trim()
            const splitter = routeSector.slice(lastIndex, result.index).trim()

            if (varName !== '') {
                varNames.push(varName)
            }

            if (splitter !== '') {
                splitters.push(splitter)
            }

            lastIndex = varDefRegEx.lastIndex
            varDefUsed = true
        }

        if (varDefUsed && lastIndex !== routeSector.length) {
            const splitter = routeSector.slice(lastIndex).trim()

            if (splitter !== '') {
                splitters.push(splitter)
            }
        }

        if (varDefUsed) {
            let i = 0
            let str = urlSector

            for (const splitter of splitters) {
                const varName = varNames[i]
                const slitterIndex = routeSector.indexOf(splitter)

                if (slitterIndex === -1) {
                    return false
                }

                const varValue = str.slice(0, slitterIndex - 1)

                if (varValue === '') {
                    return false
                }

                vars[varName] = varValue
                str = str.slice(slitterIndex)
                i++
            }

            const lastVarName = varNames.slice().pop()

            if (lastVarName) {
                vars[lastVarName] = str
                i++
            }

            if (i === varNames.length
                && varNames.length === splitters.length + 1
            ) {
                return true
            }
        }

        return !!(!varDefUsed && urlSector === routeSector)
    }
}

export const router = Router.getInstance()
