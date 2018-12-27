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
        return JSON.stringify(this.parser.getParsedContent());
    }

    protected init() {
        this.parsingTagName = "template";
    }
}
