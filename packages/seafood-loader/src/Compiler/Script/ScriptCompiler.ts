import {Compiler} from "../Compiler";

export class ScriptCompiler extends Compiler {
    public compile(): string {
        return this.content;
    }

    public compileAsync(): void {
        //
    }

    protected init(): void {
        this.parsingTagName = "script";
    }
}
