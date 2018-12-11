import parser from "parse5";

export default class TemplateBuilder {
    public source: string;
    private content: [];

    constructor(source: string) {
        this.source = source;
        this.content = this.parseContent();
    }

    private parseContent() {
        const parsedContent: any = parser.parseFragment(this.source);

        if (parsedContent && parsedContent.childNodes && Array.isArray(parsedContent.childNodes)) {
            return parsedContent.childNodes;
        }

        return [];
    }
}
