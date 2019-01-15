import { Parser } from './Parser'

export abstract class Compiler {
    protected readonly loader: any
    protected readonly source: string
    protected parsingTagNumber: number = 0
    protected parsingTagName?: string
    protected parseDataOnly = true

    constructor(loader: any, source: any) {
        this.loader = loader
        this.source = source
    }

    public compileAsync(): void {
        const parser = new Parser(this.source)
        parser.setCallback((error: any, parsedContent?: any[]) => {
            if (error) {
                this.loader.callback(error)
                return
            }

            try {
                const content = this.parseContent(parsedContent as any[])
                this.loader.callback(null, content)
            } catch (e) {
                this.loader.callback(e)
            }
        })
        parser.parseContent()
    }

    protected parseContent(content: any[]): string {
        if (!Number.isInteger(this.parsingTagNumber)) {
            return ''
        }

        let tagNumber = 0
        let result = ''

        for (const item of content) {
            if (item.hasOwnProperty('name')) {
                if (this.parsingTagNumber === tagNumber) {
                    if (this.parsingTagName && this.parsingTagName !== item.name) {
                        throw new Error('Component parts must be ordered.' +
                        '1. script' +
                        '2. template (only one root tag)' +
                        '3. style (optional)' +
                        `'${this.parsingTagName}' is wrong ordered.`)
                    }

                    if (this.parseDataOnly) {
                        if (item.children.length) {
                            result = item.children[0].data || ''
                        }
                    } else {
                        // for template
                        result = JSON.stringify(JSON.stringify([item]))
                    }
                    break
                }
                tagNumber++
            }
        }

        return result
    }
}
