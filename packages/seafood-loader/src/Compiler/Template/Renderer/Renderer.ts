import { ParsedData, ParsedDataType } from '../Parser/ParsedData'
import { HtmlElements } from './HtmlElements'
import { VirtualCommentNode } from './VirtualElement/VirtualCommentNode'
import { VirtualElement } from './VirtualElement/VirtualElement'
import { VirtualEmbeddedContentNode } from './VirtualElement/VirtualEmbeddedContentNode'
import { VirtualNode } from './VirtualElement/VirtualNode'
import { VirtualPackage } from './VirtualElement/VirtualPackage'
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

    public renderTree(parentNode: Element/*, componentInstance: any*/) {
        this.makeTree()
        this.virtualTree.render(parentNode)
    }

    private makeTree() {
        const virtualElement = this.createVirtualAppElement()

        this.virtualTree.storeVirtualNode(virtualElement)
        this.bindParsedItemChildrenProperty(this.parsedData, virtualElement)

        const stack = this.parsedData.reverse()

        while (stack.length) {
            const parsedItem = stack.pop() as ParsedData
            const virtualNode = this.createVirtualNode(parsedItem)

            if (virtualNode && parsedItem.children) {
                const children = parsedItem.children

                this.bindParsedItemChildrenProperty(children, virtualNode)
                stack.push(...children.reverse())
            }

            parsedItem.virtualNode = null
        }
    }

    private createVirtualNode(parsedData: ParsedData): VirtualNode | null {
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

        return virtualNode
    }

    private createVirtualElement(parsedData: ParsedData): VirtualNode {
        const virtualElement = new VirtualElement(parsedData, parsedData.position)
        let children: VirtualNode = virtualElement

        if (parsedData.attribs.hasOwnProperty('@for')) {
            children = new VirtualPackage(parsedData, virtualElement)
        }

        if (parsedData.virtualNode) {
            children.setParentVirtualNode(parsedData.virtualNode)
            parsedData.virtualNode.storeVirtualNode(children)
        }

        return virtualElement
    }

    private createTextVirtualNode(parsedData: ParsedData): VirtualTextNode {
        const virtualNode = new VirtualTextNode(parsedData, parsedData.position)

        if (parsedData.virtualNode) {
            virtualNode.setParentVirtualNode(parsedData.virtualNode)
            parsedData.virtualNode.storeVirtualNode(virtualNode)
        }

        return virtualNode
    }

    private createCommentVirtualNode(parsedData: ParsedData): VirtualCommentNode {
        const virtualNode = new VirtualCommentNode(parsedData, parsedData.position)

        if (parsedData.virtualNode) {
            virtualNode.setParentVirtualNode(parsedData.virtualNode)
            parsedData.virtualNode.storeVirtualNode(virtualNode)
        }

        return virtualNode
    }

    private createEmbedContentVirtualNode(parsedData: ParsedData): VirtualEmbeddedContentNode {
        const virtualNode = new VirtualEmbeddedContentNode(parsedData, parsedData.position)

        if (parsedData.virtualNode) {
            virtualNode.setParentVirtualNode(parsedData.virtualNode)
            parsedData.virtualNode.storeVirtualNode(virtualNode)
        }

        return virtualNode
    }

    private isItHtmlTag(element: any): boolean {
        return HtmlElements.includes(element.name)
    }

    private isItEmbedContentTag(parsedData: ParsedData): boolean {
        return parsedData.name === 'content'
    }

    private bindParsedItemChildrenProperty(items: ParsedData[], virtualNode: VirtualNode) {
        for (const index in items) {
            if (items.hasOwnProperty(index)) {
                items[+index].position = +index

                if (virtualNode) {
                    items[+index].virtualNode = virtualNode
                }
            }
        }
    }

    private createVirtualAppElement(): VirtualElement {
        const virtualElementParsedData: ParsedData = {
            attribs: {id: 'app-root'},
            name: 'div',
            position: 0,
            type: ParsedDataType.Tag,
            data: ''
        }

        return new VirtualElement(virtualElementParsedData, 0)
    }
}
