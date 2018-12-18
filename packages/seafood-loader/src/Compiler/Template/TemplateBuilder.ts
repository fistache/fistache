import HtmlParser from "htmlparser2";
import {SynchronousPromise} from "synchronous-promise";
import {EParsedNodeType} from "./EParsedNodeType";
import {VirtualComponentNode} from "./VirtualDocumentTree/Nodes/VirtualComponentNode";
import {VirtualEmbeddedContentNode} from "./VirtualDocumentTree/Nodes/VirtualEmbeddedContentNode";
import {VirtualTagNode} from "./VirtualDocumentTree/Nodes/VirtualTagNode";
import {VirtualTextNode} from "./VirtualDocumentTree/Nodes/VirtualTextNode";
import {VirtualDocumentTree} from "./VirtualDocumentTree/VirtualDocumentTree";
import {VirtualElement} from "./VirtualDocumentTree/VirtualElement";
import {VirtualNode} from "./VirtualDocumentTree/VirtualNode";
import {VirtualCommentNode} from "./VirtualDocumentTree/Nodes/VirtualCommentNode";

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

    public readonly reservedTags: string[] = [
        "content",
    ];

    public source: string;

    private readonly virtualDocumentTree: VirtualDocumentTree;
    private originalContent: any;

    constructor(source: string) {
        this.source = source;
        this.virtualDocumentTree = new VirtualDocumentTree();
        this.parseContent();
        this.buildVirtualTree();
    }

    public renderTree(parentNode: any, initialScope: any) {
        this.virtualDocumentTree.setParentNode(parentNode);
        this.virtualDocumentTree.getScope().addArea(initialScope);
        this.virtualDocumentTree.render();
    }

    protected buildVirtualTree() {
        let stack: any = this.originalContent;
        this.setVirtualParentNodeForChildNodes(stack);

        while (stack.length) {
            const element = stack.pop();
            const childNodes = element.children ? element.children.slice().reverse() : [];
            const virtualParentNode = this.createVirtualNodeRefferingToElement(element, element.virtualParentNode);

            this.setVirtualParentNodeForChildNodes(childNodes, virtualParentNode);
            stack = stack.concat(childNodes);
        }
    }

    protected createVirtualNodeRefferingToElement(element: any, parentElement?: VirtualElement): VirtualNode {
        let virtualNode = null;

        switch (element.type) {
            case(EParsedNodeType.Text):
                virtualNode = this.createTextVirtualNode(element, parentElement);
                break;
            case(EParsedNodeType.Comment):
                virtualNode = this.createCommentVirtualNode(element, parentElement);
                break;
            case(EParsedNodeType.Tag):
                if (this.isItHtmlTag(element)) {
                    virtualNode = this.createTagVirtualNode(element, parentElement);
                } else if (this.isItReservedTag(element)) {
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
        type: new () => VirtualNode,
        parsedNode: any,
        parentVirtualElement?: VirtualElement,
    ) {
        const virtualComponentNode = new type();
        virtualComponentNode.setParsedNode(parsedNode);

        if (parentVirtualElement) {
            virtualComponentNode.setParentVirtualElement(parentVirtualElement);
        }

        return virtualComponentNode;
    }

    protected createComponentVirtualNode(parsedNode: any, parentVirtualElement?: VirtualElement): VirtualNode {
        return this.createVirtualNodeOfType(VirtualComponentNode, parsedNode, parentVirtualElement);
    }

    protected createTagVirtualNode(parsedNode: any, parentVirtualElement?: VirtualElement): VirtualNode {
        return this.createVirtualNodeOfType(VirtualTagNode, parsedNode, parentVirtualElement);
    }

    protected createTextVirtualNode(parsedNode: any, parentVirtualElement?: VirtualElement): VirtualNode {
        return this.createVirtualNodeOfType(VirtualTextNode, parsedNode, parentVirtualElement);
    }

    protected createCommentVirtualNode(parsedNode: any, parentVirtualElement?: VirtualElement): VirtualNode {
        return this.createVirtualNodeOfType(VirtualCommentNode, parsedNode, parentVirtualElement);
    }

    protected createEmbedContentVirtualNode(parsedNode: any, parentVirtualElement?: VirtualElement): VirtualNode {
        return this.createVirtualNodeOfType(VirtualEmbeddedContentNode, parsedNode, parentVirtualElement);
    }

    protected parseContent() {
        let parsedContent: any;
        this.parseFragment(this.source).then((content: any) => {
            parsedContent = content;
        }).catch((error: any) => {
            throw new Error(error);
        });

        this.originalContent = parsedContent;
    }

    private parseFragment(fragment: string) {
        return new SynchronousPromise((resolve, reject) => {
            // @ts-ignore
            const handler = new HtmlParser.DomHandler((error, dom) => {
                if (error) {
                    reject(error);
                }

                resolve(dom);
            });
            const parser = new HtmlParser.Parser(handler, {
                xmlMode: true,
            });
            parser.write(fragment);
            parser.end();
        });
    }

    private isItHtmlTag(element: any): boolean {
        return this.htmlTags.includes(element.name);
    }

    private isItReservedTag(element: any): boolean {
        return this.reservedTags.includes(element.name);
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
