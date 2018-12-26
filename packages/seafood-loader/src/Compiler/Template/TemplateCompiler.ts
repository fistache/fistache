import path from "path";
import {RequestGenerator} from "../../RequestGenerator";
import {Compiler} from "../Compiler";
import {Parser} from "./Parser";

export class TemplateCompiler extends Compiler {
    public static readonly EXPORT_BUILDER_CLASS = "Builder";
    public static readonly EXPORT_BUILDER_INSTANCE = "builder";

    private parser: Parser;

    constructor(loader: any, source: any) {
        super(loader, source);
        this.parser = new Parser(this.content);
    }

    public compile(): string {
        const builderRequest = RequestGenerator.generate(
            this.loader,
            path.resolve(__dirname, "../src/Compiler/Template/TemplateBuilder.ts"),
        );

        return `
        import {default as ${TemplateCompiler.EXPORT_BUILDER_CLASS}} from ${builderRequest}

        const ${TemplateCompiler.EXPORT_BUILDER_INSTANCE} = new ${TemplateCompiler.EXPORT_BUILDER_CLASS}()

        ${TemplateCompiler.EXPORT_BUILDER_INSTANCE}.setParsedContent(${JSON.stringify(this.parser.getParsedContent())})
        ${TemplateCompiler.EXPORT_BUILDER_INSTANCE}.buildVirtualTree()

        export default ${TemplateCompiler.EXPORT_BUILDER_INSTANCE}
        `;
    }

    protected init() {
        this.parsingTagName = "template";
    }
}
