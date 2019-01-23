import LoaderUtils from 'loader-utils'
import { CompactRequestQuery } from './CompactRequestQuery'

export class RequestGenerator {
    public static generate(
        loaderContext: any,
        url: string, query?: CompactRequestQuery,
        loaders?: Array<string | object>
    ): string {
        const queryString = query ? query.toString() : ''
        let loadersString = ''

        if (loaders) {
            loaders.forEach((loader: any) => {
                let result = ''
                if (typeof loader === 'string') {
                    result = loader
                } else if (typeof loader === 'object') {
                    const loaderPath = loader.path
                    const loaderOptions = loader.options ? '?' + (typeof loader.options === 'string'
                        ? loader.options
                        : JSON.stringify(loader.options)) : ''
                    result += `${loaderPath}${loaderOptions}`
                }
                loadersString += `${result}!`
            })

            if (loaders.length) {
                loadersString = `!!${loadersString}`
            }
        }

        return LoaderUtils.stringifyRequest(
            loaderContext,
            `${loadersString}${url}${queryString.length ? '?' + queryString : ''}`
        )
    }
}
