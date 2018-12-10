import hash from "hash-sum";
import LoaderUtils from "loader-utils";
import path from "path";
import {CompactRequestQuery} from "./CompactRequestQuery";
import {Compiler} from "./Compiler/Compiler";
import {HmrPlugin} from "./HotModuleReplacement/HmrPlugin";

export class SeafoodLoader {
    public static readonly REQUEST_FLAG_COMPILE = "compile";
    public static readonly EXPORT_COMPONENT_CLASS_NAME = "Component";
    public static readonly EXPORT_HMR_CLASS_NAME = "Hmr";
    public static readonly EXPORT_COMPONENT_INSTANCE_NAME = "component";

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
        return this.query.hasKey(SeafoodLoader.REQUEST_FLAG_COMPILE);
    }

    protected generateRequestToMyself(url: string, query?: CompactRequestQuery): string {
        const {loaders} = this.loader;
        return this.generateRequest(loaders.slice(), url, query);
    }

    protected generateRequest(loaders: Array<string | object>, url: string, query?: CompactRequestQuery): string {
        const queryString = query ? query.toString() : "";
        let loadersString = "";

        loaders.forEach((loader: any) => {
            let result = "";
            if (typeof loader === "string") {
                result = loader;
            } else if (typeof loader === "object") {
                const loaderPath = loader.path;
                const loaderOptions = loader.options ? "?" + JSON.stringify(loader.options) : "";
                result += `${loaderPath}${loaderOptions}`;
            }
            loadersString += `${result}!`;
        });

        if (loaders.length) {
            loadersString = `!!${loadersString}`;
        }

        return LoaderUtils.stringifyRequest(
            this.loader,
            `${loadersString}${url}${queryString.length ? "?" + queryString : ""}`,
        );
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

    private resolveCompilationRequest(): string {
        const compiler = new Compiler(this.source);

        return compiler.compile();
    }

    private exportCompiledComponentInstance(): string {
        // Экспортировать обьект класса, который в конструкторе высчитает
        // всё, что ему будет необходимо для отрисовки самого себя.

        const query = new CompactRequestQuery({
            [SeafoodLoader.REQUEST_FLAG_COMPILE]: true,
        });
        const request = this.generateRequestToMyself(this.resourcePath, query);
        const hmrRequest = this.generateRequest([], path.resolve(__dirname, "./HotModuleReplacement/Hmr.ts"));

        const r = path.resolve(__dirname, "./HotModuleReplacement/Hmr.ts");
        this.hmrPlugin.setComponentRequest(request);

        return `
            import {default as ${SeafoodLoader.EXPORT_COMPONENT_CLASS_NAME}} from ${request}
            import {Hmr as ${SeafoodLoader.EXPORT_HMR_CLASS_NAME} from ${hmrRequest}

            const ${SeafoodLoader.EXPORT_COMPONENT_INSTANCE_NAME} = new ${SeafoodLoader.EXPORT_COMPONENT_CLASS_NAME}()

            ${this.getHmrCode()}

            export default ${SeafoodLoader.EXPORT_COMPONENT_INSTANCE_NAME}
        `;
    }
}
