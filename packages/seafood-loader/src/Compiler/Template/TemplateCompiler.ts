import { Compiler } from '../Compiler'

export class TemplateCompiler extends Compiler {
    protected parsingTagNumber: number = 1
    protected parseDataOnly = false
}
