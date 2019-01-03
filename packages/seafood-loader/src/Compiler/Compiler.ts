export abstract class Compiler {
    protected readonly loader: any
    protected readonly source: string
    protected parsingTagName?: string
    protected content: any

    constructor(loader: any, source: any) {
        this.loader = loader
        this.source = source
        this.init()
        this.parseContent()
    }

    public abstract compile(): string

    public abstract compileAsync(callback: (error: any, parsedContent?: string) => void): void

    protected abstract init(): void

    protected parseContent(): void {
        if (!this.parsingTagName) {
            this.content = ''
            return
        }

        const regex = new RegExp(
            `<\s*\/?\s*${this.parsingTagName}\s*.*?>(.*)<\s*\/\s*${this.parsingTagName}\s*.*?>`,
            's',
        )
        const result: any = this.source.match(regex)

        if (result && result.length) {
            this.content = result[1]
        } else {
            this.content = ''
        }
    }
}
