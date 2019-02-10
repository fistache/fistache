import hash from 'hash-sum'
import { OptionObject, stringifyRequest } from 'loader-utils'
import path from 'path'
import postcss from 'postcss'
import { OutputParams } from 'query-string'
import {loader as WepbackLoader} from 'webpack'
import { LoadersArrayItem } from '../interfaces'
import {
    compileScript,
    compileStyle,
    compileTemplate,
    isStyleGlobal
} from './compile'
import { HmrPlugin } from './Hmr/HmrPlugin'
import ScopeStyles from './ScopeStyles'
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
    private readonly options: OptionObject
    private readonly query: OutputParams
    private readonly source: string

    private readonly scopeId: string
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
        this.scopeId = this.computeScopeId()
    }

    public resolveRequest() {
        if (this.shouldScopeStyle()) {
            this.appendStyleScope()
        } else if (this.shouldCompile()) {
            this.compile()
        } else {
            this.packUp()
        }
    }

    private shouldCompile(): boolean {
        return SeafoodLoaderQueryFlag.Compile in this.query
    }

    private shouldScopeStyle(): boolean {
        return this.options && this.options.scopeId
    }

    private compile() {
        switch (this.query[SeafoodLoaderQueryFlag.Compile]) {
            case(SeafoodLoaderCompileSection.Script):
                compileScript(this.source, this.loaderContext)
                break
            case(SeafoodLoaderCompileSection.Template):
                compileTemplate(this.source, this.loaderContext, this.scopeId)
                break
            case(SeafoodLoaderCompileSection.Style):
                compileStyle(
                    this.source,
                    this.getStyleResourcesFileImport(),
                    this.loaderContext
                )
                break
        }
    }

    private appendStyleScope() {
        const scopeId = this.options && this.options.scopeId
        this.loaderContext.callback(null, postcss(
            [ScopeStyles(scopeId)]
        ).process(this.source).css)
    }

    /**
     * All parts of the component going to get packed up at this moment.
     * This is the first request in the loader. Other requests starts from here.
     */
    private packUp() {
        const scriptRequest = this.makeScriptCompileRequest()
        const templateRequest = this.makeTemplateCompileRequest()
        const styleRequest = this.makeStyleCompileRequest()
        const hmrRequest = stringifyRequest(
            this.loaderContext,
            path.resolve(__dirname, '../src/Hmr/Hmr.ts')
        )

        this.hmrPlugin.setTemplateRequest(templateRequest)

        this.loaderContext.callback(null, `
            import { ComponentSymbol } from '@seafood/component'
            import script from ${scriptRequest}
            import template from ${templateRequest}
            import style from ${styleRequest}
            import Hmr from ${hmrRequest}

            script.prototype.__render = template
            script.prototype.__style = style
            script.prototype[ComponentSymbol] = true

            ${this.hmrPlugin.generateCode()}

            export default script
        `)
    }

    private makeCompileRequest(section: SeafoodLoaderCompileSection) {
        const {loaders, resourcePath} = this.loaderContext
        const query = `?${SeafoodLoaderQueryFlag.Compile}=${section}&` +
            `scopeId=${this.scopeId}`

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

    private makeStyleCompileRequest() {
        const {resourcePath} = this.loaderContext
        const query = `?${SeafoodLoaderQueryFlag.Compile}=` +
            `${SeafoodLoaderCompileSection.Style}&scopeId=${this.scopeId}`

        return generateRequest(
            this.loaderContext,
            this.computeStyleLoaders(),
            resourcePath,
            query
        )
    }

    private generateRequestId() {
        const {resourcePath, resourceQuery} = this.loaderContext
        const filePath = path
            .relative(this.cwd, resourcePath)
            .replace(/^(\.\.[\/\\])+/, '')
            .replace(/\\/g, '/') + resourceQuery

        return hash(filePath)
    }

    private computeScopeId(): string {
        return this.query && this.query.scopeId
            || this.options && this.options.scopeId
            || `_${this.requestId}`
    }

    private computeStyleLoaders(): LoadersArrayItem[] {
        let userLoaders: any[] | null
            = this.getStyleRules()

        if (!userLoaders) {
            userLoaders = [{
                loader: 'css-loader'
            }, {
                loader: 'stylus-loader'
            }]
        }

        const indexOfStylus = userLoaders.findIndex((loader: any) => {
            return loader.loader === 'stylus-loader'
        })

        if (!isStyleGlobal(this.source)) {
            userLoaders.splice(
                indexOfStylus,
                0,
                {
                    loader: '@seafood/loader',
                    options: {
                        scopeId: this.scopeId
                    }
                }
            )
        }

        userLoaders.push({
            loader: '@seafood/loader'
        })

        return userLoaders.map((loader: any) => {
            return {
                path: loader.loader,
                options: loader.options
            }
        })
    }

    private getStyleRules(): any[] | null {
        let result = null

        if (this.options
            && this.options.styleRules
            && this.options.styleRules.use
        ) {
            result = this.options.styleRules.use.map((loader: any) => {
                return {
                    loader: loader.loader
                }
            })
        }

        return result
    }

    private getStyleResourcesFileImport(): string {
        return `@import "${this.getStyleResourcesFile()}"`
    }

    private getStyleResourcesFile(): string {
        if (this.options
            && this.options.styleResourcesFile
        ) {
            return this.options.styleResourcesFile
        }

        return path.resolve(this.cwd, 'resources/style/resources.styl')
    }
}
