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
        const event: ParsedDataAttrib[] = []
        const dynamic: ParsedDataAttrib[] = []
        const technical: ParsedDataAttrib[] = []
        const staticAttribs: ParsedDataAttrib[] = []
        const result: ParsedDataAttribs = {}

        for (const attribName in attribs) {
            if (attribs.hasOwnProperty(attribName)) {
                const attribValue: string = attribs[attribName]

                if (attribName === '&') {
                    result.bind = attribValue
                } else if (this.testIsThisEventAttribute(attribName)) {
                    event.push({
                        name: attribName,
                        value: attribValue
                     })
                } else if (this.testIsThisTechnicalAttribute(attribName)) {
                    technical.push({
                        name: attribName,
                        value: attribValue
                    })
                } else if (this.testIsThisDynamicAttribute(attribName, attribValue)) {
                    dynamic.push({
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

        if (event.length) {
            result.event = event
        }

        if (dynamic.length) {
            result.dynamic = dynamic
        }

        if (technical.length) {
            result.technical = technical
        }

        if (staticAttribs.length) {
            result.static = staticAttribs
        }

        return result
    }

    private testIsThisEventAttribute(attributeName: string): boolean {
        const regex = new RegExp(/^(:[a-zA-Z0-9_.-]+(?<!-))$/)
        return regex.test(attributeName)
    }

    private testIsThisTechnicalAttribute(attributeName: string): boolean {
        const regex = new RegExp(/^(@[a-zA-Z0-9_.-]+(?<!-))$/)
        return regex.test(attributeName)
    }

    private testIsThisDynamicAttribute(attributeName: string, attributeValue: string): boolean {
        // @ts-ignore
        this._attributeName = attributeName
        return attributeValue[0] === '{' && attributeValue[attributeValue.length - 1] === '}'
    }
}
