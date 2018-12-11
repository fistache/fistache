import {Compiler} from "../Compiler";

export class ScriptCompiler extends Compiler {
    public compile(): string {
        return this.content;
    }

    protected init(): void {
        this.parsingTagName = "script";
    }
}
