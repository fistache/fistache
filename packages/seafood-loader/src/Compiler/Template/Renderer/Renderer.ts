import { ParsedData, ParsedDataType } from '../Parser/ParsedData'
import { HtmlElements } from './HtmlElements'
import { VirtualCommentNode } from './VirtualElement/VirtualCommentNode'
import { VirtualElement } from './VirtualElement/VirtualElement'
import { VirtualEmbeddedContentNode } from './VirtualElement/VirtualEmbeddedContentNode'
import { VirtualObject } from './VirtualElement/VirtualObject'
import { VirtualTextNode } from './VirtualElement/VirtualTextNode'
import { VirtualTree } from './VirtualElement/VirtualTree'

export default class Renderer {
    private readonly virtualTree: VirtualTree

    private parsedData: ParsedData[]

    constructor() {
        this.virtualTree = new VirtualTree()
        this.parsedData = []
    }

    public setParsedContent(parsedContent: any): void {
        this.parsedData = parsedContent
    }

    public renderTree(parentNode: Element, componentInstance: any) {
        // tmp
        const pd = this.parsedData[1].children.slice()
        for (let i = 0; i < 1000; i++) {
            this.parsedData[1].children.push(...pd)
        }

        this.makeTree()
        this.virtualTree.render(parentNode)

        // tmp
        Array.from(this.virtualTree.virtualNodes)[1].delete()
    }

    private makeTree() {
        this.bindParsedItemChildrenProperty(this.parsedData, this.virtualTree)
        const stack = this.parsedData.reverse()

        while (stack.length) {
            const parsedItem = stack.pop() as ParsedData
            const virtualNode = this.createVirtualNode(parsedItem)

            if (virtualNode && parsedItem.children) {
                const children = parsedItem.children

                this.bindParsedItemChildrenProperty(children, virtualNode)
                stack.push(...children.reverse())
            }
        }
    }

    private createVirtualNode(parsedData: ParsedData): VirtualObject | null {
        let virtualNode = null

        switch (parsedData.type) {
            case(ParsedDataType.Text):
                virtualNode = this.createTextVirtualNode(parsedData)
                break
            case(ParsedDataType.Comment):
                virtualNode = this.createCommentVirtualNode(parsedData)
                break
            case(ParsedDataType.Tag):
                if (this.isItHtmlTag(parsedData)) {
                    virtualNode = this.createVirtualElement(parsedData)
                } else if (this.isItEmbedContentTag(parsedData)) {
                    virtualNode = this.createEmbedContentVirtualNode(parsedData)
                } else {
                    // todo: implement seperate class for a component
                    virtualNode = this.createVirtualElement(parsedData)
                }
                break
            default:
                console.warn(`Unknown virtual object type "${parsedData.type}".`)
        }

        if (virtualNode) {
            parsedData.virtualObject.storeVirtualNode(virtualNode)
        }

        return virtualNode
    }

    private createVirtualElement(parsedData: ParsedData): VirtualElement {
        return new VirtualElement(parsedData)
    }

    private createTextVirtualNode(parsedData: ParsedData): VirtualTextNode {
        return new VirtualTextNode(parsedData)
    }

    private createCommentVirtualNode(parsedData: ParsedData): VirtualCommentNode {
        return new VirtualCommentNode(parsedData)
    }

    private createEmbedContentVirtualNode(parsedData: ParsedData): VirtualEmbeddedContentNode {
        return new VirtualEmbeddedContentNode(parsedData)
    }

    private isItHtmlTag(element: any): boolean {
        return HtmlElements.includes(element.name)
    }

    private isItEmbedContentTag(parsedData: ParsedData): boolean {
        return parsedData.name === 'content'
    }

    private bindParsedItemChildrenProperty(items: ParsedData[], virtualObject: VirtualObject) {
        for (const index in items) {
            if (items.hasOwnProperty(index)) {
                items[+index].position = +index

                if (virtualObject) {
                    items[+index].virtualObject = virtualObject
                }
            }
        }
    }
}
