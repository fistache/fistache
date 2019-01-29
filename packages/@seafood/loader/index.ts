import { getOptions } from 'loader-utils'
import QueryString from 'query-string'
import {loader as WepbackLoader} from 'webpack'
import { SeafoodLoader } from './src/SeafoodLoader'
import LoaderContext = WepbackLoader.LoaderContext

export default function(this: LoaderContext, source: any): void {
    this.async()

    if (typeof this.cacheable !== 'undefined') {
        this.cacheable()
    }

    if (typeof source === 'object') {
        source = source.toString('utf8')
    }

    const {rootContext, resourceQuery} = this
    const cwd = rootContext || process.cwd()
    const options = getOptions(this)
    const query = QueryString.parse(resourceQuery)
    const loader = new SeafoodLoader(this, cwd, options, query, source)

    loader.resolveRequest()
}

export const raw = true
