import hash from "hash-sum";
import path from "path";
import {CompactRequestQuery} from "./CompactRequestQuery";
import {ScriptCompiler} from "./Compiler/Script/ScriptCompiler";
import {TemplateCompiler} from "./Compiler/Template/TemplateCompiler";
import {ECompilationFlag} from "./ECompilationFlag";
import {HmrPlugin} from "./HotModuleReplacement/HmrPlugin";
import {RequestGenerator} from "./RequestGenerator";

export class SeafoodLoader {
    public static readonly REQUEST_COMPILATION_FLAG = "compile";
    public static readonly EXPORT_SCRIPT_CLASS = "Component";
    public static readonly EXPORT_SCRIPT_INSTANCE = "component";
    public static readonly EXPORT_TEMPLATE_CLASS = "Template";
    public static readonly EXPORT_TEMPLATE_INSTANCE = "template";
    public static readonly EXPORT_HMR_CLASS = "Hmr";
    public static readonly EXPORT_HMR_INSTANCE = "hmr";
    public static readonly EXPORT_COMPILED_COMPONENT_CLASS = "CompiledComponent";

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

    public resolveRequest(): string {
        if (this.isItCompilationRequest()) {
            return this.resolveCompilationRequest();
        }

        return this.exportCompiledComponentInstance();
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

    protected makeCompilationRequest(flag: ECompilationFlag) {
        const query = new CompactRequestQuery({
            [SeafoodLoader.REQUEST_COMPILATION_FLAG]: flag,
        });

        return this.generateRequestToMyself(this.resourcePath, query);
    }

    private getScriptCompilationRequest() {
        return this.makeCompilationRequest(ECompilationFlag.Script);
    }

    private getTemplateCompilationRequest() {
        return this.makeCompilationRequest(ECompilationFlag.Template);
    }

    private resolveCompilationRequest(): string {
        let CompilerClass;
        const compilationFlag = this.query.get(SeafoodLoader.REQUEST_COMPILATION_FLAG);

        switch (Number(compilationFlag)) {
            case (ECompilationFlag.Script):
                CompilerClass = ScriptCompiler;
                break;
            case (ECompilationFlag.Template):
                CompilerClass = TemplateCompiler;
                break;
            default:
                throw new Error(`Unknown compilation flag "${compilationFlag}"`);
        }

        const compiler = new CompilerClass(this.loader, this.source);
        return compiler.compile();
    }

    private exportCompiledComponentInstance(): string {
        const scriptRequest = this.getScriptCompilationRequest();
        const templateRequest = this.getTemplateCompilationRequest();
        const hmrRequest = RequestGenerator.generate(
            this.loader,
            path.resolve(__dirname, "../src/HotModuleReplacement/Hmr.ts"),
        );

        this.hmrPlugin.setTemplateRequest(templateRequest);

        // Export a class object, which in the constructor will calculate
        // everything needed to render itself.
        return `
            import {default as ${SeafoodLoader.EXPORT_SCRIPT_CLASS}} from ${scriptRequest}
            import {default as ${SeafoodLoader.EXPORT_TEMPLATE_INSTANCE}} from ${templateRequest}
            import {default as ${SeafoodLoader.EXPORT_HMR_CLASS}} from ${hmrRequest}
            import {ICompiledComponent} from "@seafood/app"

            class ${SeafoodLoader.EXPORT_COMPILED_COMPONENT_CLASS}
            extends ${SeafoodLoader.EXPORT_SCRIPT_CLASS} implements ICompiledComponent {
                private readonly renderer: any;

                constructor(renderer: any) {
                    super();
                    this.renderer = renderer;
                }

                render(element) {
                    this.renderer.render(element)
                }
            }

            const ${SeafoodLoader.EXPORT_HMR_INSTANCE} = new ${SeafoodLoader.EXPORT_HMR_CLASS}
            const ${SeafoodLoader.EXPORT_SCRIPT_INSTANCE} =
            new ${SeafoodLoader.EXPORT_COMPILED_COMPONENT_CLASS}(${SeafoodLoader.EXPORT_TEMPLATE_INSTANCE})

            ${this.getHmrCode()}

            export default ${SeafoodLoader.EXPORT_SCRIPT_INSTANCE}
        `;
    }
}
