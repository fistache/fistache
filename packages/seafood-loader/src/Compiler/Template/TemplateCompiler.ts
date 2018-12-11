import path from "path";
import {RequestGenerator} from "../../RequestGenerator";
import {Compiler} from "../Compiler";

export class TemplateCompiler extends Compiler {
    public static readonly EXPORT_BUILDER_CLASS = "Builder";
    public static readonly EXPORT_BUILDER_INSTANCE = "builder";

    public compile(): string {
        const builderRequest = RequestGenerator.generate(
            this.loader,
            path.resolve(__dirname, "../src/Compiler/Template/TemplateBuilder.ts"),
        );

        return `
        import {default as ${TemplateCompiler.EXPORT_BUILDER_CLASS}} from ${builderRequest}

        const ${TemplateCompiler.EXPORT_BUILDER_INSTANCE} =
        new ${TemplateCompiler.EXPORT_BUILDER_CLASS}(${JSON.stringify(this.content)})

        export default ${TemplateCompiler.EXPORT_BUILDER_INSTANCE}
        `;
    }

    protected init() {
        this.parsingTagName = "template";
    }
}
