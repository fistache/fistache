import hash from 'hash-sum'
import { OptionObject } from 'loader-utils'
import path from 'path'
import { OutputParams } from 'query-string'
import {loader as WepbackLoader} from 'webpack'
import LoaderContext = WepbackLoader.LoaderContext

export enum SeafoodLoaderQueryFlag {
    Compile = '__compile__'
}

export enum SeafoodLoaderCompilationSection {
    Script = '__script__',
    Template = '__template__',
    Style = '__style__'
}

export class SeafoodLoader {
    private readonly loaderContext: LoaderContext
    private cwd: string
    private options: OptionObject
    private readonly query: OutputParams
    private source: string

    constructor(
        loaderContext: LoaderContext,
        cwd: string,
        options: OptionObject,
        query: OutputParams,
        source: string
    ) {
        this.loaderContext = loaderContext
        this.cwd = cwd
        this.options = options
        this.query = query
        this.source = source
    }

    public resolveRequest() {
        if (this.shouldCompile()) {
            this.compile()
        } else {
            this.packUp()
        }
    }

    private shouldCompile(): boolean {
        return this.query.hasOwnProperty(SeafoodLoaderQueryFlag.Compile)
    }

    private compile() {
        switch (this.query[SeafoodLoaderQueryFlag.Compile]) {
            case(SeafoodLoaderCompilationSection.Script):
                // compile script
                break
            case(SeafoodLoaderCompilationSection.Template):
                // compile template
                break
            case(SeafoodLoaderCompilationSection.Style):
                // compile style
                break
        }
    }

    /**
     * All parts of the component going to get packed up at this moment.
     * This is the first request to the loader. Other requests starts here.
     */
    private packUp() {
        //
    }

    private generateRequestId() {
        const {resourcePath, resourceQuery} = this.loaderContext
        const filePath = path
            .relative(this.cwd, resourcePath)
            .replace(/^(\.\.[\/\\])+/, '')
            .replace(/\\/g, '/') + resourceQuery

        return hash(filePath)
    }
}
