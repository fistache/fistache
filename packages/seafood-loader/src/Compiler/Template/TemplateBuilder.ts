import _ from "lodash";
import parser from "parse5";
import {EOriginalNodeType} from "./EOriginalNodeType";
import {CommentVirtualNode} from "./VirtualNodes/CommentVirtualNode";
import {ComplexVirtualNode} from "./VirtualNodes/ComplexVirtualNode";
import {ComponentVirtualNode} from "./VirtualNodes/ComponentVirtualNode";
import {EmbedContentVirtualNode} from "./VirtualNodes/EmbedContentVirtualNode";
import {TagVirtualNode} from "./VirtualNodes/TagVirtualNode";
import {TextVirtualNode} from "./VirtualNodes/TextVirtualNode";
import {VirtualNode} from "./VirtualNodes/VirtualNode";
import {VirtualTree} from "./VirtualTree";

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

    private readonly virtualTree: VirtualTree;
    private originalContent: any;

    constructor(source: string) {
        this.source = source;
        this.virtualTree = new VirtualTree();
        console.log(this.virtualTree);
        this.parseContent();
        this.buildVirtualTree();
    }

    protected buildVirtualTree() {
        let stack = [this.originalContent];
        this.setVirtualParentNodeForChildNodes(stack);

        while (stack.length) {
            const element = stack.pop();
            const childNodes = _.slice(element.childNodes).reverse();
            const virtualParentNode = this.createVirtualNodeRefferingToElement(element, element.virtualParentNode);

            this.setVirtualParentNodeForChildNodes(childNodes, virtualParentNode);
            stack = stack.concat(childNodes);
        }
    }

    protected createVirtualNodeRefferingToElement(element: any, parentElement?: ComplexVirtualNode): VirtualNode {
        let virtualNode = null;

        switch (element.nodeName) {
            case(EOriginalNodeType.DocumentFragment):
                virtualNode = this.createComponentVirtualNode(element, parentElement);
                break;
            case(EOriginalNodeType.Text):
                virtualNode = this.createTextVirtualNode(element, parentElement);
                break;
            case(EOriginalNodeType.Comment):
                virtualNode = this.createCommentVirtualNode(element, parentElement);
                break;
            default:
                if (this.isItHtmlTag(element)) {
                    virtualNode = this.createTagVirtualNode(element, parentElement);
                } else if (this.isItReservedTag(element)) {
                    virtualNode = this.createEmbedContentVirtualNode(element, parentElement);
                } else {
                    virtualNode = this.createComponentVirtualNode(element, parentElement);
                }
        }

        return virtualNode;
    }

    protected createComponentVirtualNode(element: any, parentElement?: ComplexVirtualNode): VirtualNode {
        return new ComponentVirtualNode(element, parentElement);
    }

    protected createTagVirtualNode(element: any, parentElement?: ComplexVirtualNode): VirtualNode {
        return new TagVirtualNode(element, parentElement);
        // return new VirtualNode(`tag ${element.tagName}`);
    }

    protected createTextVirtualNode(element: any, parentElement?: ComplexVirtualNode): VirtualNode {
        return new TextVirtualNode(element, parentElement);
        // return new VirtualNode(`text "${element.value}"`);
    }

    protected createCommentVirtualNode(element: any, parentElement?: ComplexVirtualNode): VirtualNode {
        return new CommentVirtualNode(element, parentElement);
        // return new VirtualNode(`comment "${element.data}"`);
    }

    protected createEmbedContentVirtualNode(element: any, parentElement?: ComplexVirtualNode): VirtualNode {
        return new EmbedContentVirtualNode(element, parentElement);
        // return new VirtualNode(`embed content`);
    }

    protected parseContent(): void {
        let parsedContent: any = parser.parseFragment(this.source, {
            scriptingEnabled: false,
        });

        if (!parsedContent || !parsedContent.childNodes || !Array.isArray(parsedContent.childNodes)) {
            parsedContent = {};
        }

        this.originalContent = parsedContent;
    }

    private isItHtmlTag(element: any): boolean {
        return this.htmlTags.includes(element.tagName);
    }

    private isItReservedTag(element: any): boolean {
        return this.reservedTags.includes(element.tagName);
    }

    private setVirtualParentNodeForChildNodes(childNodes: any[], parent?: any): void {
        let parentElement = this.virtualTree;

        if (parent) {
            parentElement = parent;
        }

        childNodes.forEach((node: any) => {
            node.virtualParentNode = parentElement;
        });
    }
}
