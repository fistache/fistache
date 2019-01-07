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

    public prepare() {
        // todo: to make tree in the loader, not in a browser
        const virtualElement = this.createVirtualAppElement()

        this.virtualTree.addChildVirtualNode(virtualElement)
        virtualElement.setParentVirtualNode(this.virtualTree)
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

    public render(parentNode: Element/*, componentInstance: any*/) {
        const stack = this.virtualTree.getChildVirtualNodesAsArray().reverse()

        while (stack.length) {
            const virtualNode = stack.pop() as VirtualNode

            virtualNode.render()

            // Get child nodes only after render because virtual
            // package can create a new one.
            const childVirtualNodes = virtualNode.getChildVirtualNodesAsArray().reverse()

            if (virtualNode.shouldRenderChildVirtualNodes()) {
                stack.push(...childVirtualNodes)
            }
        }

        this.virtualTree.append(parentNode)
    }

    public setParsedData(parsedContent: any): void {
        this.parsedData = parsedContent
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
        const { position, virtualNode: parentVirtualNode } = parsedData
        const virtualElement = new VirtualElement(parsedData, position, parentVirtualNode as VirtualNode)
        let virtualObject: VirtualNode = virtualElement

        if (parsedData.attribs.hasOwnProperty('@for')) {
            virtualObject = new VirtualPackage(parsedData , virtualElement, parentVirtualNode as VirtualNode)
        }

        if (parsedData.virtualNode) {
            parsedData.virtualNode.addChildVirtualNode(virtualObject)
            virtualObject.setParentVirtualNode(parsedData.virtualNode)
        }

        virtualElement.beforeRender()

        return virtualElement
    }

    private createTextVirtualNode(parsedData: ParsedData): VirtualTextNode {
        const { position, virtualNode: parentVirtualNode } = parsedData
        const virtualNode = new VirtualTextNode(parsedData, position, parentVirtualNode as VirtualNode)

        if (parsedData.virtualNode) {
            virtualNode.setParentVirtualNode(parsedData.virtualNode)
            parsedData.virtualNode.addChildVirtualNode(virtualNode)
        }

        return virtualNode
    }

    private createCommentVirtualNode(parsedData: ParsedData): VirtualCommentNode {
        const { position, virtualNode: parentVirtualNode } = parsedData
        const virtualNode = new VirtualCommentNode(parsedData, position, parentVirtualNode as VirtualNode)

        if (parsedData.virtualNode) {
            virtualNode.setParentVirtualNode(parsedData.virtualNode)
            parsedData.virtualNode.addChildVirtualNode(virtualNode)
        }

        return virtualNode
    }

    private createEmbedContentVirtualNode(parsedData: ParsedData): VirtualEmbeddedContentNode {
        const { position, virtualNode: parentVirtualNode } = parsedData
        const virtualNode = new VirtualEmbeddedContentNode(parsedData, position, parentVirtualNode as VirtualNode)

        if (parsedData.virtualNode) {
            virtualNode.setParentVirtualNode(parsedData.virtualNode)
            parsedData.virtualNode.addChildVirtualNode(virtualNode)
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
            attribs: {
                static: [{
                    name: 'id',
                    value: 'app-root'
                }],
                dynamic: [],
                technical: [],
                technicalDynamic: []
            },
            name: 'div',
            position: 0,
            type: ParsedDataType.Tag,
            data: ''
        }

        return new VirtualElement(virtualElementParsedData, 0, this.virtualTree)
    }
}
