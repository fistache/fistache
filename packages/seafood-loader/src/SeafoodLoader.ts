import hash from "hash-sum";
import path from "path";
import {CompactRequestQuery} from "./CompactRequestQuery";
import {CompilationFlag} from "./CompilationFlag";
import {ScriptCompiler} from "./Compiler/Script/ScriptCompiler";
import {TemplateCompiler} from "./Compiler/Template/TemplateCompiler";
import {HmrPlugin} from "./HotModuleReplacement/HmrPlugin";
import {RequestGenerator} from "./RequestGenerator";

export class SeafoodLoader {
    public static readonly REQUEST_COMPILATION_FLAG = "compile";
    public static readonly EXPORT_SCRIPT_CLASS = "Component";
    public static readonly EXPORT_SCRIPT_INSTANCE = "component";
    public static readonly EXPORT_TEMPLATE_BUILDER_CLASS = "TemplateBuilder";
    public static readonly EXPORT_TEMPLATE_INSTANCE = "template";
    public static readonly EXPORT_TEMPLATE_CONTENT = "templateContent";
    public static readonly EXPORT_HMR_CLASS = "Hmr";
    public static readonly EXPORT_HMR_INSTANCE = "hmr";
    public static readonly EXPORT_COMPILED_COMPONENT_CLASS = "CompiledComponent";
    public static readonly EXPORT_COMPILED_COMPONENT_INSTANCE = "compiledComponent";

    protected readonly loader: any;
    protected readonly context: string;
    protected readonly resourcePath: string;
    protected readonly query: CompactRequestQuery;
    protected readonly source: string;

    protected readonly requestHash: string;
    protected readonly hmrPlugin: HmrPlugin;

    constructor(loader: any, context: string, query: CompactRequestQuery, source: string) {
        const {resourcePath} = loader;
        this.loader = loader;
        this.context = context;
        this.resourcePath = resourcePath;
        this.query = query;
        this.source = source;
        this.requestHash = this.generateRequestHash();
        this.hmrPlugin = new HmrPlugin(this.requestHash);
    }

    public resolveRequest(): void {
        if (this.isItCompilationRequest()) {
            this.resolveCompilationRequest();
        } else {
            this.exportCompiledComponentInstance();
        }
    }

    protected isItCompilationRequest(): boolean {
        return this.query.hasKey(SeafoodLoader.REQUEST_COMPILATION_FLAG);
    }

    protected generateRequestToMyself(url: string, query?: CompactRequestQuery): string {
        const {loaders} = this.loader;
        return RequestGenerator.generate(this.loader, url, query, loaders.slice());
    }

    protected generateRequestHash() {
        const {resourceQuery} = this.loader;
        const filePath = path
            .relative(this.context, this.resourcePath)
            .replace(/^(\.\.[\/\\])+/, "")
            .replace(/\\/g, "/") + resourceQuery;

        return hash(filePath);
    }

    protected getHmrCode(): string {
        return this.hmrPlugin.generateCode();
    }

    protected makeCompilationRequest(flag: CompilationFlag) {
        const query = new CompactRequestQuery({
            [SeafoodLoader.REQUEST_COMPILATION_FLAG]: flag,
        });

        return this.generateRequestToMyself(this.resourcePath, query);
    }

    private getScriptCompilationRequest() {
        return this.makeCompilationRequest(CompilationFlag.Script);
    }

    private getTemplateCompilationRequest() {
        const query = new CompactRequestQuery({
            [SeafoodLoader.REQUEST_COMPILATION_FLAG]: CompilationFlag.Template,
        });

        return RequestGenerator.generate(this.loader, this.resourcePath, query, ["seafood-loader"]);
    }

    private resolveCompilationRequest(): void {
        let CompilerClass;
        const compilationFlag = this.query.get(SeafoodLoader.REQUEST_COMPILATION_FLAG);

        switch (Number(compilationFlag)) {
            case (CompilationFlag.Script):
                CompilerClass = ScriptCompiler;
                break;
            case (CompilationFlag.Template):
                CompilerClass = TemplateCompiler;
                break;
            default:
                throw new Error(`Unknown compilation flag "${compilationFlag}"`);
        }

        const compiler = new CompilerClass(this.loader, this.source);
        this.loader.callback(null, compiler.compile());
    }

    private exportCompiledComponentInstance(): void {
        const templateContentRequest = this.getTemplateCompilationRequest();

        this.loader.loadModule(
            JSON.parse(templateContentRequest),
            (error: any, parsedContent: string) => {
                if (error) {
                    this.loader.callback(error);
                    return;
                }

                const scriptRequest = this.getScriptCompilationRequest();
                const templateRequest = RequestGenerator.generate(
                    this.loader,
                    path.resolve(__dirname, "../src/Compiler/Template/TemplateBuilder.ts"),
                );
                const hmrRequest = RequestGenerator.generate(
                    this.loader,
                    path.resolve(__dirname, "../src/HotModuleReplacement/Hmr.ts"),
                );

                this.hmrPlugin.setTemplateRequest(templateContentRequest);

                this.loader.callback(null, `
                import {default as ${SeafoodLoader.EXPORT_SCRIPT_CLASS}} from ${scriptRequest}
                import {default as ${SeafoodLoader.EXPORT_TEMPLATE_BUILDER_CLASS}} from ${templateRequest}
                import {default as ${SeafoodLoader.EXPORT_HMR_CLASS}} from ${hmrRequest}
                import {CompiledComponent} from "@seafood/app"

                const ${SeafoodLoader.EXPORT_TEMPLATE_INSTANCE} = new ${SeafoodLoader.EXPORT_TEMPLATE_BUILDER_CLASS}()
                ${SeafoodLoader.EXPORT_TEMPLATE_INSTANCE}.setParsedContent(${parsedContent});
                ${SeafoodLoader.EXPORT_TEMPLATE_INSTANCE}.buildVirtualTree();

                const ${SeafoodLoader.EXPORT_SCRIPT_INSTANCE} = new ${SeafoodLoader.EXPORT_SCRIPT_CLASS}()
                const ${SeafoodLoader.EXPORT_COMPILED_COMPONENT_INSTANCE} =
                new CompiledComponent(
                    ${SeafoodLoader.EXPORT_SCRIPT_INSTANCE},
                    ${SeafoodLoader.EXPORT_TEMPLATE_INSTANCE}
                )

                ${this.getHmrCode()}

                export default ${SeafoodLoader.EXPORT_COMPILED_COMPONENT_INSTANCE}
                `);
            },
        );
    }
}
