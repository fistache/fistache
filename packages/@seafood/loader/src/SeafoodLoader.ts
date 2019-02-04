import hash from 'hash-sum'
import { OptionObject, stringifyRequest } from 'loader-utils'
import path from 'path'
import { OutputParams } from 'query-string'
import {loader as WepbackLoader} from 'webpack'
import { compileScript, compileStyle, compileTemplate } from './compile'
import { HmrPlugin } from './Hmr/HmrPlugin'
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

    private readonly requestId: string
    private readonly hmrPlugin: HmrPlugin

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
        this.requestId = this.generateRequestId()
        this.hmrPlugin = new HmrPlugin(this.requestId)
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
        const hmrRequest = stringifyRequest(
            this.loaderContext,
            path.resolve(__dirname, '../src/Hmr/Hmr.ts')
        )

        this.hmrPlugin.setTemplateRequest(templateRequest)

        this.loaderContext.callback(null, `
            import { ComponentSymbol } from '@seafood/component'
            import script from ${scriptRequest}
            import template from ${templateRequest}
            import Hmr from ${hmrRequest}

            script.prototype.__render = template
            script.prototype[ComponentSymbol] = true

            ${this.hmrPlugin.generateCode()}

            export default script
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
