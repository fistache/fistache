import LoaderContext = WebpackLoader.LoaderContext
import { compile } from '@seafood/compiler'
import {loader as WebpackLoader} from 'webpack'

const scriptMatchRegex = new RegExp('<script>(.*?)<\\/script>', 's')
const styleMatchRegex = new RegExp('<style>(.*?)<\\/style>', 's')

export function compileScript(source: string, loaderContext: LoaderContext) {
    const scriptMatch = source.match(scriptMatchRegex)
    let script = ''

    if (scriptMatch) {
        script = scriptMatch[1]
    }

    loaderContext.callback(null, script)
}

export function compileTemplate(source: string, loaderContext: LoaderContext) {
    source = stripScriptTag(source).trim()
    source = stripStyleTag(source).trim()

    compile(source, (result: string) => {
        loaderContext.callback(null, result)
    })
}

export function compileStyle(source: string, loaderContext: LoaderContext) {
    const scriptMatch = source.match(styleMatchRegex)
    let script = ''

    if (scriptMatch) {
        script = scriptMatch[1]
    }

    loaderContext.callback(null, script)
}

function stripScriptTag(source: string) {
    return source.replace(scriptMatchRegex, '')
}

function stripStyleTag(source: string) {
    return source.replace(styleMatchRegex, '')
}
