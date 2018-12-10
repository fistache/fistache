import LoaderUtils from "loader-utils";
import {CompactRequestQuery} from "./CompactRequestQuery";

export class SeafoodLoader {
    public static readonly COMPILATION_REQUEST_FLAG = "compile";

    private readonly loader: any;
    private readonly context: string;
    private readonly resourcePath: string;
    private readonly query: CompactRequestQuery;
    private readonly source: string;

    constructor(loader: any, context: string, resourcePath: string, query: CompactRequestQuery, source: string) {
        this.loader = loader;
        this.context = context;
        this.resourcePath = resourcePath;
        this.query = query;
        this.source = source;
    }

    public resolveRequest(): string {
        if (this.isItCompilationRequest()) {
            return this.resolveCompilationRequest();
        }

        return this.exportCompiledComponentInstance();
    }

    private isItCompilationRequest(): boolean {
        return this.query.hasOwnProperty(SeafoodLoader.COMPILATION_REQUEST_FLAG);
    }

    private generateRequestToMyself(query: CompactRequestQuery): string {
        return this.generateRequest(["seafood-loader"], query);
    }

    private generateRequest(loaders: string[], query: CompactRequestQuery): string {
        return LoaderUtils.stringifyRequest(
            this.loader,
            `!!${loaders.join("!")}?${query.toString()}`,
        );
    }

    private resolveCompilationRequest(): string {
        //
    }

    private exportCompiledComponentInstance(): string {
        // Экспортировать обьект класса, который в конструкторе высчитает
        // всё, что ему будет необходимо для отрисовки самого себя.
    }
}
