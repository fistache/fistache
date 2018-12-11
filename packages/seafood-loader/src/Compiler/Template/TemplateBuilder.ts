import _ from "lodash";
import parser from "parse5";
import {EOriginalNodeType} from "./EOriginalNodeType";
import {IParentVirtualNode} from "./VirtualNodes/IParentVirtualNode";
import {VirtualNode} from "./VirtualNodes/VirtualNode";

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

    public source: string;

    private virtualTree: any;
    private originalContent: any;

    constructor(source: string) {
        this.source = source;
        this.parseContent();
        this.buildVirtualTree();
    }

    protected buildVirtualTree() {
        let stack = [this.originalContent];
        let parentNode: VirtualNode;

        while (stack.length) {
            const element = stack.pop();
            parentNode = this.createVirtualNodeRefferingToElement(element);
            console.log(parentNode.type);
            stack = stack.concat(_.slice(element.childNodes).reverse());
        }
    }

    protected createVirtualNodeRefferingToElement(element: any, parentElement?: IParentVirtualNode): VirtualNode {
        // tmp
        console.log(element);

        let virtualNode = null;

        switch (element.nodeName) {
            case(EOriginalNodeType.DocumentFragment):
                virtualNode = this.createVirtualComponentNode(element, parentElement);
                break;
            case(EOriginalNodeType.Text):
                virtualNode = this.createVirtualTextNode(element, parentElement);
                break;
            case(EOriginalNodeType.Comment):
                virtualNode = this.createVirtualCommentNode(element, parentElement);
                break;
            default:
                if (this.isItHtmlTag(element)) {
                    // Empty nodeName means it is tag node.
                    virtualNode = this.createVirtualTagNode(element, parentElement);
                } else {
                    virtualNode = this.createVirtualComponentNode(element, parentElement);
                }
        }

        return virtualNode;
    }

    protected createVirtualComponentNode(element: any, parentElement?: IParentVirtualNode): VirtualNode {
        return new VirtualNode("component");
    }

    protected createVirtualTagNode(element: any, parentElement?: IParentVirtualNode): VirtualNode {
        return new VirtualNode(`tag ${element.tagName}`);
    }

    protected createVirtualTextNode(element: any, parentElement?: IParentVirtualNode): VirtualNode {
        return new VirtualNode(`text "${element.value}"`);
    }

    protected createVirtualCommentNode(element: any, parentElement?: IParentVirtualNode): VirtualNode {
        return new VirtualNode(`comment "${element.data}"`);
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
        return this.htmlTags.includes(element.nodeName);
    }
}
