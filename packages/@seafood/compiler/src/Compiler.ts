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

interface TagAttrib {
    name: string
    value?: string
}

export enum RenderKeyword {
    Element =  'element',
    Text = 'text',
    Include = 'include'
}

export class Compiler {
    private readonly source: string

    private doneCallback?: () => void
    private errorCallback?: (error: any) => void

    private rootTag: TagInfo = {
        name: 'root',
        isComponent: false,
        injectionType: InjectionType.None,
        children: []
    }
    private lastTag = this.rootTag
    private dependencies: string[] = []

    private parser!: Parser

    constructor(source: string) {
        this.source = source
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
        const firstChild = this.rootTag.children[0]
        let renderFunction = ''

        if ((firstChild as TagInfo)!.renderString) {
            renderFunction = `${
                this.dependencies.join('\n')
            }\n${
                (firstChild as TagInfo).renderString as string
            }`
        } else if ((firstChild as TextNode).text) {
            renderFunction = this.makeTextRenderFunction(
                (firstChild as TextNode).text
            )
        }

        return `export default function(` +
            `${Object.values(RenderKeyword).join(',')}` +
            `) {\n` + renderFunction + `\n}`
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
                const text = this.filterText((info as TextNode).text)

                if (text) {
                    return this.makeTextRenderFunction(text)
                }
            }

            return (info as TagInfo).renderString
        }).filter((result: string | undefined) => {
            return !!result
        })

        if (tag.isComponent) {
            this.dependencies.push(
                `const ${tag.name} = ${RenderKeyword.Include}('${tag.name}')`
            )
        }

        return `${RenderKeyword.Element}(` +
            `${tag.isComponent ? tag.name : `'${tag.name}'`},` +
            `${JSON.stringify(
                tag.attributes
                    ? this.filterAttributes(tag.attributes)
                    : null
            )},` +
            `${children!.length ? `[${children}]` : null}` +
        `)`
    }

    private filterAttributes(attributes: TagAttrib[]) {
        const injections: string[] = []
        const staticAttributes: TagAttrib[] = []
        const dynamicAttributes: TagAttrib[] = []
        const specialAttributes: TagAttrib[] = []
        const result: {
            injections?: string[]
            staticAttributes?: TagAttrib[]
            dynamicAttributes?: TagAttrib[]
            specialAttributes?: TagAttrib[]
        } = {}

        for (const attribute of attributes) {
            if (attribute.name.startsWith('{')) {
                const injection = attribute.name.slice(1, -1).trim()

                if (injection.length) {
                    injections.push(injection)
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
                        .slice(1, -1).trim()
                }

                if (hasInjection && !specialAttribute.value!.length) {
                    throw new Error(
                        `Invalid value passed for '${attribute.name}'.`
                    )
                }

                specialAttributes.push(specialAttribute)
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

        if (injections.length) {
            result.injections = injections
        }
        if (specialAttributes.length) {
            result.specialAttributes = specialAttributes
        }
        if (dynamicAttributes.length) {
            result.dynamicAttributes = dynamicAttributes
        }
        if (staticAttributes.length) {
            result.staticAttributes = staticAttributes
        }

        return result
    }

    private filterText(text: string | null | undefined): string | null {
        if (!text) {
            return null
        }

        // todo: check out if this line broke down a layout
        text = text.trim()

        if (text === '') {
            return null
        }

        return text
    }

    private makeTextRenderFunction(text: string) {
        return `${RenderKeyword.Text}(${JSON.stringify(text)})`
    }

    private isItComponentName(name: string): boolean {
        return !HtmlTags.includes(name)
    }
}

export function compile(source: string, callback: (result: string) => void) {
    const compiler = new Compiler(source)

    compiler.error((error: any) => {
        throw error
    })
    compiler.done(() => {
        callback(compiler.getRenderFunction())
    })
    compiler.parse()
}
