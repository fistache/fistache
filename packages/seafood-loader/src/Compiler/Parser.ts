import HtmlParser from 'htmlparser2'
import { ParsedDataAttrib, ParsedDataAttribs } from './ParsedData'

export class Parser {
    private source: string
    private callback?: (error: any, parsedContent?: any[]) => void

    public constructor(source: string) {
        this.source = source
    }

    public setCallback(callback: (error: any, parsedContent?: any[]) => void): void {
        this.callback = callback
    }

    public parseContent(): void {
        if (this.callback) {
            this.parseFragment(this.source).then((parsedContent: any) => {
                if (this.callback) {
                    this.checkOnlyOneRootTag(parsedContent)
                    this.decycleObject(parsedContent)
                    this.callback(null, parsedContent)
                }
            }).catch((error: any) => {
                if (this.callback) {
                    this.callback(error)
                }
            })
        }
    }

    public parseFragment(fragment: string): Promise<any> {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            const handler = new HtmlParser.DomHandler((error, dom) => {
                if (error) {
                    reject(error)
                }

                resolve(dom)
            })
            const parser = new HtmlParser.Parser(handler, {
                xmlMode: true
            })
            parser.write(fragment)
            parser.end()
        })
    }

    private checkOnlyOneRootTag(content: any[]) {
        let tagsCount = 0

        for (const item of content) {
            if (item.type === 'tag') {
                tagsCount++
            }

            if (tagsCount > 1) {
                throw new Error('Component must contain only one root tag.')
            }
        }
    }

    private decycleObject(content: any): void {
        const stack = content.slice()

        while (stack.length) {
            const item = stack.pop()

            for (const fieldName in item) {
                if (item.hasOwnProperty(fieldName)) {
                    if (fieldName === 'next' ||
                        fieldName === 'prev' ||
                        fieldName === 'parent'
                    ) {
                        delete item[fieldName]
                    }
                }
            }

            if (item.attribs) {
                item.attribs = this.parseAttribs(item.attribs)
            }

            if (item.children) {
                stack.push(...item.children.slice())
            }
        }
    }

    private parseAttribs(attribs: any): ParsedDataAttribs {
        const dynamic: ParsedDataAttrib[] = []
        const technical: ParsedDataAttrib[] = []
        const technicalDynamic: ParsedDataAttrib[] = []
        const staticAttribs: ParsedDataAttrib[] = []

        for (const attribName in attribs) {
            if (attribs.hasOwnProperty(attribName)) {
                const attribValue = attribs[attribName]

                if (this.testIsThisDynamicAttribute(attribName)) {
                    dynamic.push({
                        name: attribName,
                        value: attribValue
                     })
                } else if (this.testIsThisTechnicalAttribute(attribName)) {
                    technical.push({
                        name: attribName,
                        value: attribValue
                    })
                } else if (this.testIsThisTechnicalDynamicAttribute(attribName)) {
                    technicalDynamic.push({
                        name: attribName,
                        value: attribValue
                    })
                } else {
                    staticAttribs.push({
                        name: attribName,
                        value: attribValue
                    })
                }
            }
        }

        return {
            dynamic,
            technical,
            technicalDynamic,
            static: staticAttribs
        }
    }

    private testIsThisTechnicalAttribute(attributeName: string): boolean {
        const regex = new RegExp(/^(@[a-zA-Z0-9_.-]+(?<!-))$/)
        return regex.test(attributeName)
    }

    private testIsThisDynamicAttribute(attributeName: string): boolean {
        const regex = new RegExp(/^(:[a-zA-Z0-9_.-]+(?<!-))$/)
        return regex.test(attributeName)
    }

    private testIsThisTechnicalDynamicAttribute(attributeName: string): boolean {
        const regex = new RegExp(/^(@[a-zA-Z0-9_.-]+(?<!-))?(:[a-zA-Z0-9_.-]+(?<!-))$/)
        return regex.test(attributeName)
    }
}
