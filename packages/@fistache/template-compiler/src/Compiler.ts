import { AttributeKeyword, FunctionKeyword, TagAttrib } from '@fistache/shared'
import { Parser } from 'htmlparser2'
import { HtmlTags } from './HtmlTags'

enum InjectionType {
    None = 'none',
    Name = 'name',
    Value = 'value'
}

type NodeInfo = TextNode | TagInfo

interface TagInfo {
    name: string
    isComponent: boolean
    renderString?: string
    attributes?: TagAttrib[]
    injectionType: InjectionType
    parent?: TagInfo
    children: NodeInfo[]
}

interface TextNode {
    text: string
    parent?: TagInfo
}

interface ComponentDependency {
    componentName: string
    varName: string
}

export class Compiler {
    private readonly source: string
    private readonly scopeId: string

    private doneCallback?: () => void
    private errorCallback?: (error: any) => void

    private rootTag: TagInfo = {
        name: 'root',
        isComponent: false,
        injectionType: InjectionType.None,
        children: []
    }
    private lastTag = this.rootTag
    private dependencyCount = 0
    private dependencies = new Map<string, ComponentDependency>()

    private parser!: Parser

    constructor(source: string, scopeId: string) {
        this.source = source
        this.scopeId = scopeId
        this.configureParser()
    }

    public done(callback: () => void) {
        this.doneCallback = callback
    }

    public error(callback: (error: any) => void) {
        this.errorCallback = callback
    }

    public parse() {
        this.parser.write(this.source)
        this.parser.end()
    }

    public getRenderFunction(): string {
        let firstChild = null

        for (const child of this.rootTag.children) {
            if ((child as TagInfo).renderString
                || ((child as TextNode).text
                && (child as TextNode).text.trim())) {
                firstChild = child
                break
            }
        }

        let renderFunction = ''

        if (!firstChild) {
            renderFunction = `return ${FunctionKeyword.Text}(${
                JSON.stringify(JSON.stringify(' '))
            })`
        } else if ((firstChild as TagInfo).renderString) {
            renderFunction = `${
                [...this.dependencies.values()].map(
                    (dependency: ComponentDependency) => {
                        return `const ${dependency.varName}=` +
                            FunctionKeyword.Include +
                            `('${dependency.componentName}')`
                    }
                ).join('\n')
            };return ${
                (firstChild as TagInfo).renderString as string
            }`
        } else if ((firstChild as TextNode).text) {
            renderFunction = `return ${this.makeTextRenderFunction(
                (firstChild as TextNode).text
            )}`
        }

        return `export default function(` +
            `${Object.values(FunctionKeyword).join(',')}` +
            `){` + renderFunction + `}`
    }

    private handleOpenTagName(name: string) {
        const tag: TagInfo = {
            name,
            isComponent: this.isItComponentName(name),
            children: [],
            injectionType: InjectionType.None
        }

        tag.parent = this.lastTag
        this.lastTag.children.push(tag)

        this.lastTag = tag
    }

    private handleText(text: string) {
        this.lastTag!.children.push({
            parent: this.lastTag,
            text
        } as TextNode)
    }

    private handleCloseTag(name: string) {
        if (this.lastTag!.name !== name) {
            throw new Error(`Opened tag "${name}" is not closed.`)
        }

        this.lastTag.renderString = this.computeRenderString(this.lastTag)
        this.lastTag.injectionType = InjectionType.None
        this.lastTag = this.lastTag!.parent || this.rootTag
    }

    private handleAttribute(name: string, value: string) {
        let shouldPush = true

        if (!this.lastTag.attributes) {
            this.lastTag.attributes = []
        }

        if (this.lastTag.injectionType !== InjectionType.None) {
            const lastItemIndex = this.lastTag.attributes.length - 1
            shouldPush = false

            switch (this.lastTag.injectionType) {
                case(InjectionType.Name):
                    this.lastTag.attributes[lastItemIndex].name += ` ${name}`
                    break
                case(InjectionType.Value):
                    let result = ` ${name}`

                    if (value) {
                        result += ` ${value}`
                    }

                    this.lastTag.attributes[lastItemIndex].value += result
                    break
            }
        }

        // <tag { text }>
        //        ^^^^
        if (name.startsWith('{')) {
            this.lastTag.injectionType = InjectionType.Name
        }

        // <tag @for={ let ... }>
        //           ^^^^^^^^^^^
        if (value.startsWith('{')) {
            this.lastTag.injectionType = InjectionType.Value
        }

        if (name.includes('}') || value.includes('}')) {
            this.lastTag.injectionType = InjectionType.None
        }

        if (shouldPush) {
            this.lastTag.attributes.push({
                name, value
            })
        }
    }

    private configureParser() {
        const compiler = this
        this.parser = new Parser({
            onopentagname(name: string) {
                compiler.handleOpenTagName(name)
            },
            ontext(text: string) {
                compiler.handleText(text)
            },
            onattribute(name: string, value: string) {
                compiler.handleAttribute(name, value)
            },
            onclosetag(name: string) {
                compiler.handleCloseTag(name)
            },
            onerror(error: any) {
                compiler.fireErrorCallbackIfExists(error)
            },
            onend() {
                compiler.fireDoneCallbackIfExists()
            }
        }, {
            xmlMode: true
        })
    }

    private fireDoneCallbackIfExists() {
        if (this.doneCallback) {
            this.doneCallback()
        }
    }

    private fireErrorCallbackIfExists(error: any) {
        if (this.errorCallback) {
            this.errorCallback(error)
        }
    }

    private computeRenderString(tag: TagInfo): string {
        const children = tag.children.map((info: NodeInfo) => {
            if ((info as TextNode).text) {
                return this.makeTextRenderFunction((info as TextNode).text)
            }

            return (info as TagInfo).renderString
        }).filter((result: string | null | undefined) => {
            return !!result
        })

        if (tag.isComponent) {
            this.dependencyCount++

            if (!this.dependencies.has(tag.name)) {
                this.dependencies.set(tag.name, {
                    componentName: tag.name,
                    varName: `_${this.dependencyCount}`
                })
            }
        }

        if (tag.name === 'slot') {
            let slotId = null

            if (tag.attributes) {
                const idAttribs = tag.attributes.filter((attrib: TagAttrib) => {
                    return attrib.name === 'id'
                })

                if (idAttribs.length > 1) {
                    throw new Error(`Slot cannot have more than one "id"`)
                }

                if (idAttribs[0]) {
                    slotId = idAttribs[0].value
                }
            }

            if (!slotId) {
                throw new Error(`Slot must have a unique "id"`)
            }

            return `${FunctionKeyword.Slot}('${slotId}', ${children!.length
                ? `[${children}]`
                : null})`
        } else if (tag.name === 'content') {
            let contentId = null

            if (tag.attributes) {
                const idAttribs = tag.attributes.filter((attrib: TagAttrib) => {
                    return attrib.name === 'id'
                })

                if (idAttribs.length > 1) {
                    throw new Error(`Content cannot have more than one "id"`)
                }

                if (idAttribs[0]) {
                    contentId = idAttribs[0].value
                }
            }

            return `${FunctionKeyword.EmbeddedContent}('${contentId}')`
        }

        if (!tag.attributes) {
            tag.attributes = []
        }

        return `${tag.isComponent
            ? FunctionKeyword.Component
            : tag.name === 'content'
                ? FunctionKeyword.EmbeddedContent
                : FunctionKeyword.Element
        }(` +
            `${tag.isComponent
                ? this.dependencies.get(tag.name)!.varName
                : `'${tag.name}'`},` +
            `${JSON.stringify(
                this.filterAttributes(tag.attributes, tag.isComponent)
            )},` +
            `${children!.length
                ? `[${children}]`
                : null}` +
        `)`
    }

    private filterAttributes(attributes: TagAttrib[], isComponent = false) {
        const injectionAttributes: TagAttrib[] = []
        const staticAttributes: TagAttrib[] = []
        const dynamicAttributes: TagAttrib[] = []
        const specialAttributes: TagAttrib[] = []
        const eventAttributes: TagAttrib[] = []
        const result: any = Object.create(null)

        for (const attribute of attributes) {
            if (attribute.name.startsWith('{')) {
                const injection = attribute.name.slice(1, -1).trim()

                if (injection.length) {
                    injectionAttributes.push({ name: injection })
                }
            } else if (attribute.name.startsWith('@')) {
                const specialAttribute: TagAttrib = {
                    name: attribute.name.slice(1)
                }

                if (attribute!.value!.length &&
                    !attribute.value!.startsWith('{')
                ) {
                    throw new Error(
                        `Value of attribute '${attribute.name}' ` +
                        `must be not static. Use {} instead of "" to set ` +
                        `attribute value.`
                    )
                }

                let hasInjection = false

                if (attribute.value!.length) {
                    hasInjection = true
                    specialAttribute.value = attribute.value!
                        .slice(1, -1).trim().replace(/  +/g, ' ')
                }

                if (hasInjection && !specialAttribute.value!.length) {
                    throw new Error(
                        `Invalid value passed for '${attribute.name}'.`
                    )
                }

                if (specialAttribute.name === 'for') {
                    const expressionParts = specialAttribute.value!.split(' ')

                    if (specialAttribute.value!.includes(' of ')
                        || specialAttribute.value!.includes(' in ')) {
                        if (expressionParts[0] !== 'let') {
                            throw new Error(`Variable must be declared using ` +
                                                `'let' keyword.`
                            )
                        }

                        expressionParts.shift()
                        specialAttribute.value = expressionParts.join(' ')
                    }
                }

                specialAttributes.push(specialAttribute)
            } else if (attribute.name === ':') {
                if (!attribute!.value!.length ||
                    !attribute.value!.startsWith('{')
                ) {
                    throw new Error(
                        `Value of bind expression ` +
                        `must be not static. Use {} instead of "" to set ` +
                        `expression.`
                    )
                }

                result.bindExpression = attribute!.value!.slice(1, -1)
                    .trim()
                    .replace(/  +/g, ' ')

                if (result === '') {
                    throw new Error(`Value of bind expression cannot ` +
                                        `be empty.`)
                }
            } else if (attribute.name.startsWith('&')) {
                const eventAttribute: TagAttrib = {
                    name: attribute.name.slice(1)
                }

                if (attribute!.value!.length &&
                    !attribute.value!.startsWith('{')
                ) {
                    throw new Error(
                        `Value of attribute '${attribute.name}' ` +
                        `must be not static. Use {} instead of "" to set ` +
                        `attribute value.`
                    )
                }

                let hasInjection = false

                if (attribute.value!.length) {
                    hasInjection = true
                    eventAttribute.value = attribute.value!
                        .slice(1, -1).trim()
                }

                if (hasInjection && !eventAttribute.value!.length) {
                    throw new Error(
                        `Invalid value passed for '${attribute.name}'.`
                    )
                }

                eventAttributes.push(eventAttribute)
            } else if (attribute.value!.startsWith('{')) {
                const dynamicAttribute: TagAttrib = {
                    name: attribute.name,
                    value: attribute.value!.slice(1, -1)
                }

                dynamicAttributes.push(dynamicAttribute)
            } else {
                const staticAttribute: TagAttrib = {
                    name: attribute.name
                }

                if (attribute.value!.length) {
                    staticAttribute.value = attribute.value
                }

                staticAttributes.push(staticAttribute)
            }
        }

        if (!isComponent) {
            staticAttributes.push({
                name: this.scopeId
            })
        }

        if (injectionAttributes.length) {
            result[AttributeKeyword.Injection] = injectionAttributes
        }
        if (specialAttributes.length) {
            result[AttributeKeyword.Special] = specialAttributes
        }
        if (dynamicAttributes.length) {
            result[AttributeKeyword.Dynamic] = dynamicAttributes
        }
        if (staticAttributes.length) {
            result[AttributeKeyword.Static] = staticAttributes
        }
        if (eventAttributes.length) {
            result[AttributeKeyword.Event] = eventAttributes
        }
        // bindExpression

        return result
    }

    private filterText(text: string | null | undefined): string | null {
        if (typeof text === 'undefined' || text === null) {
            return null
        }

        // todo: check out if this line broke down a layout
        text = text.trim()

        if (text === '') {
            return null
        }

        // "str {{ text }} str"
        //      ^^^^^^^^^^

        const injectionRegex = new RegExp('{{([\\s\\S]*?)}}', 'g')
        const result: string[] = []
        let execResult
        let lastIndex = 0

        // tslint:disable-next-line: no-conditional-assignment
        while ((execResult = injectionRegex.exec(text)) !== null) {
            const expression = execResult[1].trim()

            if (execResult.index !== lastIndex) {
                const slice = text
                    .slice(lastIndex, execResult.index)
                    .replace(/  +/g, ' ')
                if (slice.trim().length) {
                    result.push(`'${slice}'`)
                }
            }

            result.push(`(${expression})`)

            lastIndex = injectionRegex.lastIndex
        }

        if (lastIndex !== text.length) {
            const slice = text.slice(lastIndex).replace(/  +/g, ' ')
            if (slice.trim().length) {
                result.push(`'${slice}'`)
            }
        }

        return JSON.stringify(result.join('+'))
    }

    private makeTextRenderFunction(text: string | null): string | null {
        text = this.filterText(text)

        if (text) {
            return `${FunctionKeyword.Text}(${text})`
        }

        return null
    }

    private isItComponentName(name: string): boolean {
        return !HtmlTags.includes(name) && name !== 'content' && name !== 'slot'
    }
}

export function compile(
    source: string,
    scopeId: string,
    callback: (result: string) => void
) {
    const compiler = new Compiler(source, scopeId)

    compiler.error((error: any) => {
        throw error
    })
    compiler.done(() => {
        callback(compiler.getRenderFunction())
    })
    compiler.parse()
}
