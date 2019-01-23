import { Compiler } from '../Compiler'

export class ScriptCompiler extends Compiler {
    protected parsingTagNumber: number = 0
    protected parsingTagName: string = 'script'
    protected parseDataOnly = true
}
