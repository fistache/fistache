import { stringifyRequest } from 'loader-utils'
import { LoadersArrayItem } from '../interfaces'

export function generateRequest(
    loaderContext: any,
    loaders: LoadersArrayItem[],
    url: string,
    query?: string
): string {
    const loaderStrings = loaders.map((loader: LoadersArrayItem) => {
        return stringifyLoader(loader)
    })

    return stringifyRequest(
        loaderContext,
        `!!${loaderStrings.join('!')}!${url}${query || ''}`
    )
}

export function stringifyLoader(loader: LoadersArrayItem): string {
    if (loader.options) {
        return `${loader.path}?${JSON.stringify(loader.options)}`
    } else {
        return `${loader.path}`
    }
}
