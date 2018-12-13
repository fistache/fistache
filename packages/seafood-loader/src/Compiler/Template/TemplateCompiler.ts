import {Compiler} from "../Compiler";
import TemplateBuilder from "./TemplateBuilder";

export class TemplateCompiler extends Compiler {
    public static readonly EXPORT_BUILDER_CLASS = "Builder";
    public static readonly EXPORT_BUILDER_INSTANCE = "builder";

    public compile(): string {
        const templateBuilder = new TemplateBuilder(this.content);
        const renderedTree = templateBuilder.compileTree();
        return `export default ${renderedTree}`;
    }

    protected init() {
        this.parsingTagName = "template";
    }
}
