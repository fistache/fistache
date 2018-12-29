import {ParsedNodeType} from "./ParsedNodeType";
import {VirtualCommentNode} from "./VirtualDocumentTree/Nodes/VirtualCommentNode";
import {VirtualComponentNode} from "./VirtualDocumentTree/Nodes/VirtualComponentNode";
import {VirtualEmbeddedContentNode} from "./VirtualDocumentTree/Nodes/VirtualEmbeddedContentNode";
import {VirtualTextNode} from "./VirtualDocumentTree/Nodes/VirtualTextNode";
import {VirtualDocumentTree} from "./VirtualDocumentTree/VirtualDocumentTree";
import {VirtualElement} from "./VirtualDocumentTree/VirtualElement";
import {VirtualTagNodeCollection} from "./VirtualDocumentTree/VirtualTagNodeCollection";

export default class TemplateBuilder {
    public readonly htmlTags: string[] = [
        "dir", "div", "dl", "dt", "em", "embed", "fieldset", "font", "form", "frame", "frameset",
        "h1", "h2", "h3", "h4", "h5", "h6", "head", "hr", /* "html" ,*/ "hype", "i", "iframe", "img",
        "video", "track", "time", "tfoot", "tbody", "summary", "source", "section",
        "ruby", "rt", "rp", "q", "progress", "output", "optgroup", "object", "nav",
        "meter", "menuitem", "mark", "main", "keygen", "header", "footer", "figure",
        "figcaption", "dialog", "details", "datalist", "canvas", "bdo", "bdi", "audio",
        "aside", "article", "acronym", "abbr", "sup", "del", "textarea", "th", "title",
        "tr", "tt", "u", "ul", "var", "wbr", "xmp", "input", "isindex", "kbd", "label",
        "legend", "li", "link", "listing", "map", "marquee", "menu", "meta", "multicol",
        "nobr", "noembed", "noframes", "noscript", "ol", "option", "p", "param", "plaintext",
        "pre", "s", "samp", "script", "select", "small", "sound", "spacer", "span", "strong",
        "style", "sub", "table", "thead", "td", "a", "address", "app", "applet", "area", "b",
        "base", "basefont", "bgsound", "big", "blink", "blockquote", /* "body",*/ "br", "button",
        "caption", "center", "cite", "code", "col", "colgroup", "comment", "dd", "ins", "dfn",
    ];

    private readonly virtualDocumentTree: VirtualDocumentTree;
    private parsedContent: any;

    constructor() {
        this.virtualDocumentTree = new VirtualDocumentTree();
        this.parsedContent = [];
    }

    public setParsedContent(parsedContent: any): void {
        this.parsedContent = parsedContent;
    }

    public renderTree(parentNode: any, initialScope: any) {
        this.virtualDocumentTree.setParentNode(parentNode);
        this.virtualDocumentTree.getComponentScope().setComponentInstance(initialScope);
        this.virtualDocumentTree.render();
    }

    public buildVirtualTree() {
        if (Array.isArray(this.parsedContent)) {
            let stack: any = this.parsedContent.reverse();
            this.setVirtualParentNodeForChildNodes(stack);

            while (stack.length) {
                const element = stack.pop();
                const childNodes = element.children ? element.children.slice().reverse() : [];
                const virtualParentNode = this.createVirtualNodeRefferingToElement(element, element.virtualParentNode);

                this.setVirtualParentNodeForChildNodes(childNodes, virtualParentNode);
                stack = stack.concat(childNodes);
            }
        }
    }

    protected createVirtualNodeRefferingToElement(element: any, parentElement?: VirtualElement): VirtualElement {
        let virtualNode = null;

        switch (element.type) {
            case(ParsedNodeType.Text):
                virtualNode = this.createTextVirtualNode(element, parentElement);
                break;
            case(ParsedNodeType.Comment):
                virtualNode = this.createCommentVirtualNode(element, parentElement);
                break;
            case(ParsedNodeType.Tag):
                if (this.isItHtmlTag(element)) {
                    virtualNode = this.createTagVirtualNode(element, parentElement);
                } else if (this.isItEmbedContentTag(element)) {
                    virtualNode = this.createEmbedContentVirtualNode(element, parentElement);
                } else {
                    virtualNode = this.createComponentVirtualNode(element, parentElement);
                }
                break;
            default:
                virtualNode = this.createComponentVirtualNode(element, parentElement);
        }

        return virtualNode;
    }

    protected createVirtualNodeOfType(
        type: new () => VirtualElement,
        parsedNode: any,
        parentVirtualElement?: VirtualElement,
    ) {
        const virtualComponentNode = new type();
        virtualComponentNode.setParsedNode(parsedNode);

        if (parentVirtualElement) {
            virtualComponentNode.setParentVirtualElementAndAddThisAsChild(parentVirtualElement);
        }

        return virtualComponentNode;
    }

    protected createComponentVirtualNode(parsedNode: any, parentVirtualElement?: VirtualElement): VirtualElement {
        return this.createVirtualNodeOfType(VirtualComponentNode, parsedNode, parentVirtualElement);
    }

    protected createTagVirtualNode(parsedNode: any, parentVirtualElement?: VirtualElement): VirtualElement {
        return this.createVirtualNodeOfType(VirtualTagNodeCollection, parsedNode, parentVirtualElement);
    }

    protected createTextVirtualNode(parsedNode: any, parentVirtualElement?: VirtualElement): VirtualElement {
        return this.createVirtualNodeOfType(VirtualTextNode, parsedNode, parentVirtualElement);
    }

    protected createCommentVirtualNode(parsedNode: any, parentVirtualElement?: VirtualElement): VirtualElement {
        return this.createVirtualNodeOfType(VirtualCommentNode, parsedNode, parentVirtualElement);
    }

    protected createEmbedContentVirtualNode(
        parsedNode: any,
        parentVirtualElement?: VirtualElement,
    ): VirtualElement {
        return this.createVirtualNodeOfType(VirtualEmbeddedContentNode, parsedNode, parentVirtualElement);
    }

    private isItHtmlTag(element: any): boolean {
        return this.htmlTags.includes(element.name);
    }

    private isItEmbedContentTag(element: any): boolean {
        return element.name === "content";
    }

    private setVirtualParentNodeForChildNodes(childNodes: any[], parent?: any): void {
        let parentElement = this.virtualDocumentTree;

        if (parent) {
            parentElement = parent;
        }

        childNodes.forEach((node: any) => {
            node.virtualParentNode = parentElement;
        });
    }
}
