import { Compiler } from '../../Compiler'
import { Parser } from './Parser'

export class TemplateCompiler extends Compiler {
    public static readonly EXPORT_BUILDER_CLASS = 'Builder'
    public static readonly EXPORT_BUILDER_INSTANCE = 'builder'

    constructor(loader: any, source: any) {
        super(loader, source)
    }

    public compile(): string {
        return ''
    }

    public compileAsync(callback: (error: any, parsedContent?: string) => void): void {
        const parser = new Parser(this.content)
        parser.setCallback(callback)
        parser.parseContent()
    }

    protected init() {
        this.parsingTagName = 'template'
    }
}
