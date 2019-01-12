import { CompiledComponent } from '@seafood/app'
import { Component } from '@seafood/component'
import { ParsedData, ParsedDataAttrib, ParsedDataType } from '../Parser/ParsedData'
import { HtmlElements } from './HtmlElements'
import { VirtualCommentNode } from './VirtualElement/VirtualCommentNode'
import { VirtualComponent } from './VirtualElement/VirtualComponent'
import { VirtualElement } from './VirtualElement/VirtualElement'
import { VirtualEmbeddedContentNode } from './VirtualElement/VirtualEmbeddedContentNode'
import { VirtualNode } from './VirtualElement/VirtualNode'
import { VirtualPackage } from './VirtualElement/VirtualPackage'
import { VirtualTextNode } from './VirtualElement/VirtualTextNode'
import { VirtualTree } from './VirtualElement/VirtualTree'

export default class Renderer {
    private readonly virtualTree: VirtualTree

    private parsedData: ParsedData[]

    private usedComponents?: Map<string, CompiledComponent>

    constructor() {
        this.virtualTree = new VirtualTree()
        this.parsedData = []
    }

    public prepare(usedComponents?: Map<string, CompiledComponent>) {
        // todo: to make a virtual tree in the loader, not in a browser
        this.usedComponents = usedComponents
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

            parsedItem.virtualNode = null
        }
    }

    public render(parentNode: Element, component: Component) {
        this.virtualTree.getScope().setContext(component)
        this.virtualTree.beforeRender()

        const stack = this.virtualTree.getChildVirtualNodesAsArray().reverse()

        while (stack.length) {
            const virtualNode = stack.pop() as VirtualNode

            virtualNode.getScope().setContext(component)
            virtualNode.beforeRender()
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
                const compiledComponent = this.getCompiledComponent(parsedData)
                if (compiledComponent) {
                    virtualNode = this.createVirtualComponent(compiledComponent as CompiledComponent, parsedData)
                } else if (this.isItHtmlTag(parsedData)) {
                    virtualNode = this.createVirtualElement(parsedData)
                } else if (this.isItEmbedContentTag(parsedData)) {
                    virtualNode = this.createEmbedContentVirtualNode(parsedData)
                } else {
                    throw new Error(`Undefined component <${parsedData.name}>`)
                }
                break
            default:
                console.warn(`Unknown virtual object type "${parsedData.type}".`)
        }

        return virtualNode
    }

    private createVirtualComponent(compiledComponent: CompiledComponent, parsedData: ParsedData): VirtualNode {
        const { position, virtualNode: parentVirtualNode } = parsedData
        const virtualComponent = new VirtualComponent(compiledComponent, position, parentVirtualNode as VirtualNode)
        const forExpression = this.getForAttributeValue(parsedData.attribs.technical)
        let virtualObject: VirtualNode = virtualComponent

        if (forExpression) {
            virtualObject = new VirtualPackage(
                parsedData,
                virtualComponent,
                parentVirtualNode as VirtualNode,
                forExpression
            )
        }

        if (parsedData.virtualNode) {
            parsedData.virtualNode.addChildVirtualNode(virtualObject)
            virtualObject.setParentVirtualNode(parsedData.virtualNode)
        }

        return virtualComponent
    }

    private createVirtualElement(parsedData: ParsedData): VirtualNode {
        const { position, virtualNode: parentVirtualNode } = parsedData
        const virtualElement = new VirtualElement(parsedData, position, parentVirtualNode as VirtualNode)
        const forExpression = this.getForAttributeValue(parsedData.attribs.technical)
        let virtualObject: VirtualNode = virtualElement

        if (forExpression) {
            virtualObject = new VirtualPackage(
                parsedData,
                virtualElement,
                parentVirtualNode as VirtualNode,
                forExpression
            )
        }

        if (parsedData.virtualNode) {
            parsedData.virtualNode.addChildVirtualNode(virtualObject)
            virtualObject.setParentVirtualNode(parsedData.virtualNode)
        }

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

    private getCompiledComponent(parsedData: ParsedData): CompiledComponent | null {
        if (this.usedComponents) {
            const iterator = this.usedComponents[Symbol.iterator]()
            for (const record of iterator) {
                const componentName = record[0]
                const componentValue = record[1]

                if (componentName === parsedData.name) {
                    return componentValue
                }
            }
        }

        return null
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

    private getForAttributeValue(attribs: ParsedDataAttrib[]): string | undefined {
        for (const attrib of attribs) {
            if (attrib.name === '@for') {
                return attrib.value
            }
        }

        return undefined
    }
}
