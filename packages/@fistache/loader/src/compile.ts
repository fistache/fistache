import LoaderContext = WebpackLoader.LoaderContext
import { compile } from '@fistache/template-compiler'
import {loader as WebpackLoader} from 'webpack'

const scriptMatchRegex = new RegExp(
    '<[^>]*?script[^>]*?>(.*?)<[^>]*?\\/[^>]*?script[^>]*?>',
    's'
)
const styleMatchRegex = new RegExp(
    '<[^>]*?style[^>]*?>(.*?)<[^>]*?\\/[^>]*?style[^>]*?>',
    's'
)

export function compileScript(source: string, loaderContext: LoaderContext) {
    const scriptMatch = source.match(scriptMatchRegex)
    let script = ''

    if (scriptMatch) {
        script = scriptMatch[1]
    }

    loaderContext.callback(null, script)
}

export function compileTemplate(
    source: string,
    loaderContext: LoaderContext,
    scopeId: string
) {
    source = stripScriptTag(source).trim()
    source = stripStyleTag(source).trim()

    compile(source, scopeId, (result: string) => {
        loaderContext.callback(null, result)
    })
}

export function compileStyle(
    source: string,
    resourcesImport: string,
    loaderContext: LoaderContext
) {
    const styleMatch = source.match(styleMatchRegex)
    let script = ''

    if (styleMatch) {
        script = styleMatch[1]
    }

    loaderContext.callback(
        null,
        `${resourcesImport} \n${script}`
    )
}

export function isStyleGlobal(source: string): boolean {
    const styleMatch = source.match(styleMatchRegex)

    if (styleMatch) {
        const attribs = styleMatch[0].slice(
            styleMatch[0].indexOf('<') + 1,
            styleMatch[0].indexOf('>')
        ).split(' ')

        attribs.shift()

        if (attribs.findIndex((attrib: string) => {
            return attrib.toLowerCase() === 'global'
        }) !== -1) {
            return true
        }
    }

    return false
}

function stripScriptTag(source: string) {
    return source.replace(scriptMatchRegex, '')
}

function stripStyleTag(source: string) {
    return source.replace(styleMatchRegex, '')
}
