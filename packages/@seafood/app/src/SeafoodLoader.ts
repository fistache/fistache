import hash from 'hash-sum'
import { OptionObject } from 'loader-utils'
import path from 'path'
import { OutputParams } from 'query-string'
import {loader as WepbackLoader} from 'webpack'
import { compileScript, compileStyle, compileTemplate } from './compile'
import { generateRequest } from './utils'
import LoaderContext = WepbackLoader.LoaderContext

export enum SeafoodLoaderQueryFlag {
    Compile = 'compile'
}

export enum SeafoodLoaderCompileSection {
    Script = 'script',
    Template = 'template',
    Style = 'style'
}

export class SeafoodLoader {
    private readonly loaderContext: LoaderContext
    private cwd: string
    private options: OptionObject
    private readonly query: OutputParams
    private readonly source: string

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
        return SeafoodLoaderQueryFlag.Compile in this.query
    }

    private compile() {
        switch (this.query[SeafoodLoaderQueryFlag.Compile]) {
            case(SeafoodLoaderCompileSection.Script):
                compileScript(this.source, this.loaderContext)
                break
            case(SeafoodLoaderCompileSection.Template):
                compileTemplate(this.source, this.loaderContext)
                break
            case(SeafoodLoaderCompileSection.Style):
                compileStyle(this.source, this.loaderContext)
                break
        }
    }

    /**
     * All parts of the component going to get packed up at this moment.
     * This is the first request in the loader. Other requests starts from here.
     */
    private packUp() {
        const scriptRequest = this.makeScriptCompileRequest()
        const templateRequest = this.makeTemplateCompileRequest()

        this.loaderContext.callback(null, `
            import ComponentUnit from '@seafood/app'
            import script from ${scriptRequest}
            import template from ${templateRequest}

            console.log(script, template, ComponentUnit)
        `)
    }

    private makeCompileRequest(section: SeafoodLoaderCompileSection) {
        const {loaders, resourcePath} = this.loaderContext
        const query = `?${SeafoodLoaderQueryFlag.Compile}=${section}`

        return generateRequest(
            this.loaderContext,
            loaders.slice(),
            resourcePath,
            query
        )
    }

    private makeScriptCompileRequest() {
        return this.makeCompileRequest(SeafoodLoaderCompileSection.Script)
    }

    private makeTemplateCompileRequest() {
        return this.makeCompileRequest(SeafoodLoaderCompileSection.Template)
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
