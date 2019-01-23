import { Compiler } from '../Compiler'

export class StyleCompiler extends Compiler {
    protected parsingTagNumber: number = 2
    protected parsingTagName: string = 'style'
    protected parseDataOnly = true
}
