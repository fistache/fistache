import { Parser } from 'htmlparser2'

enum InjectionType {
    None = 'none',
    Name = 'name',
    Value = 'value'
}

interface TagInfo {
    name: string
    attributes?: TagAttrib[]
    injectionType: InjectionType
    parent?: TagInfo
    children: Array<TagInfo | TextNode>
}

interface TextNode {
    text: string
    parent?: TagInfo
}

interface TagAttrib {
    name: string
    value?: string
}

export class Compiler {
    private readonly source: string

    private doneCallback?: () => void
    private errorCallback?: (error: any) => void

    private renderFunction = ''
    private rootTag: TagInfo = {
        name: 'root',
        injectionType: InjectionType.None,
        children: []
    }
    private lastTag = this.rootTag

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
        return this.renderFunction
    }

    private handleOpenTagName(name: string) {
        const tag: TagInfo = {
            name,
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
