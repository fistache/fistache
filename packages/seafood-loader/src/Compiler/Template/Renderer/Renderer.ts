// import { HtmlTags } from './HtmlTags'

export default class Renderer {
    private parsedContent: any

    constructor() {
        this.parsedContent = []
    }

    public setParsedContent(parsedContent: any): void {
        this.parsedContent = parsedContent
    }

    public renderTree(parentNode: any, componentInstance: any) {
        console.log(parentNode, componentInstance)
    }

    public buildVirtualTree() {
        for (const parsedItem of this.parsedContent) {
            console.log(parsedItem)
        }
    }

    // protected createVirtualNodeRefferingToElement(element: any, parentElement?: VirtualElement): VirtualElement {
    //     let virtualNode = null
    //
    //     switch (element.type) {
    //         case(ParsedNodeType.Text):
    //             virtualNode = this.createTextVirtualNode(element, parentElement)
    //             break
    //         case(ParsedNodeType.Comment):
    //             virtualNode = this.createCommentVirtualNode(element, parentElement)
    //             break
    //         case(ParsedNodeType.Tag):
    //             if (this.isItHtmlTag(element)) {
    //                 virtualNode = this.createTagVirtualNode(element, parentElement)
    //             } else if (this.isItEmbedContentTag(element)) {
    //                 virtualNode = this.createEmbedContentVirtualNode(element, parentElement)
    //             } else {
    //                 virtualNode = this.createComponentVirtualNode(element, parentElement)
    //             }
    //             break
    //         default:
    //             virtualNode = this.createComponentVirtualNode(element, parentElement)
    //     }
    //
    //     return virtualNode
    // }
    //
    // protected createVirtualNodeOfType(
    //     type: new () => VirtualElement,
    //     parsedNode: any,
    //     parentVirtualElement?: VirtualElement,
    // ) {
    //     const virtualComponentNode = new type()
    //     virtualComponentNode.setParsedNode(parsedNode)
    //
    //     if (parentVirtualElement) {
    //         virtualComponentNode.setParentVirtualElementAndAddThisAsChild(parentVirtualElement)
    //     }
    //
    //     return virtualComponentNode
    // }
    //
    // protected createComponentVirtualNode(parsedNode: any, parentVirtualElement?: VirtualElement): VirtualElement {
    //     return this.createVirtualNodeOfType(VirtualComponentNode, parsedNode, parentVirtualElement)
    // }
    //
    // protected createTagVirtualNode(parsedNode: any, parentVirtualElement?: VirtualElement): VirtualElement {
    //     return this.createVirtualNodeOfType(VirtualTagNodeCollection, parsedNode, parentVirtualElement)
    // }
    //
    // protected createTextVirtualNode(parsedNode: any, parentVirtualElement?: VirtualElement): VirtualElement {
    //     return this.createVirtualNodeOfType(VirtualTextNode, parsedNode, parentVirtualElement)
    // }
    //
    // protected createCommentVirtualNode(parsedNode: any, parentVirtualElement?: VirtualElement): VirtualElement {
    //     return this.createVirtualNodeOfType(VirtualCommentNode, parsedNode, parentVirtualElement)
    // }
    //
    // protected createEmbedContentVirtualNode(
    //     parsedNode: any,
    //     parentVirtualElement?: VirtualElement,
    // ): VirtualElement {
    //     return this.createVirtualNodeOfType(VirtualEmbeddedContentNode, parsedNode, parentVirtualElement)
    // }
    //
    // private isItHtmlTag(element: any): boolean {
    //     return HtmlTags.includes(element.name)
    // }
    //
    // private isItEmbedContentTag(element: any): boolean {
    //     return element.name === 'content'
    // }
    //
    // private setVirtualParentNodeForChildNodes(childNodes: any[], parent?: any): void {
    //     let parentElement = this.virtualDocumentTree
    //
    //     if (parent) {
    //         parentElement = parent
    //     }
    //
    //     childNodes.forEach((node: any) => {
    //         node.virtualParentNode = parentElement
    //     })
    // }
}
