import path from 'path'

export function createRenderer(bundle: string, template: string) {
    const bundleJson = JSON.parse(bundle)
    const file = bundleJson.server && bundleJson.server.js

    if (!file) {
        throw new Error(`server.json is invalid`)
    }

    return (url: string) => {
        const { JSDOM } = __non_webpack_require__('jsdom')
        const dom = new JSDOM(template, {
            url
        })

        global.window = dom.window
        global.document = window.document
        global.navigator = window.navigator

        const filePath = path.join(path.resolve('dist'), file)
        const createApp = __non_webpack_require__(filePath).default
        const { app } = createApp()

        return render(app)
    }
}

function render(app: any) {
    const container = document.getElementById('app')

    app.run(container)

    return document.documentElement.innerHTML
}
