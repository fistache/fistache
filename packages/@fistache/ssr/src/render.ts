// @ts-ignore
import requireFromString from 'require-from-string'

export function createRenderer(
    clientBundle: any,
    serverBundle: any,
    template: string
) {
    if (!serverBundle) {
        throw new Error(`server.json is invalid`)
    }

    // todo: preload, prefetch

    return async (url: string) => {
        // @ts-ignore
        const { JSDOM } = __non_webpack_require__('jsdom', {
            url
        })
        const dom = new JSDOM(template)

        // @ts-ignore
        global.window = dom.window
        // @ts-ignore
        global.document = window.document
        // @ts-ignore
        global.navigator = window.navigator

        preloadScripts(clientBundle)
        appendFetchIfExists()

        // @ts-ignore
        const app = await requireFromString(serverBundle).default({
            // context params
        })

        return render(app, clientBundle)
    }
}

function render(app: any, clientBundle: any) {
    const container = document.getElementById('app')

    app.shouldUseStyles = true
    app.run(container)
    appendScripts(clientBundle)

    return document.documentElement.innerHTML
}

function preloadScripts(clientBundle: any) {
    for (const src of clientBundle) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = src
        link.setAttribute('as', 'script')

        document.head.appendChild(link)
    }
}

function appendFetchIfExists() {
    if (window.FISTACHE_FETCH) {
        const script = document.createElement('script')

        script.innerHTML = `window.FISTACHE_FETCH = ${window.FISTACHE_FETCH}`

        document.head.appendChild(script)
    }
}

function appendScripts(clientBundle: any) {
    for (const src of clientBundle) {
        const script = document.createElement('script')
        script.src = src

        document.body.appendChild(script)
    }
}
