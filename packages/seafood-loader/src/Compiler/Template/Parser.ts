import HtmlParser from "htmlparser2";

export class Parser {
    private source: string;
    private callback?: (error: any, parsedContent?: string) => void;

    public constructor(source: string) {
        this.source = source;
    }

    public setCallback(callback: (error: any, parsedContent?: string) => void): void {
        this.callback = callback;
    }

    public parseContent(): void {
        if (this.callback) {
            this.parseFragment(this.source).then((parsedContent: any) => {
                if (this.callback) {
                    this.callback(null, this.removeLinksToObjects(parsedContent));
                }
            }).catch((error: any) => {
                if (this.callback) {
                    this.callback(error);
                }
            });
        }
    }

    public parseFragment(fragment: string): Promise<any> {
        return new Promise((resolve, reject) => {
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

    private removeLinksToObjects(content: any): any {
        let jsonableContent;

        if (Array.isArray(content)) {
            jsonableContent = [];
            for (const item of content) {
                jsonableContent.push(this.removeLinksToObjects(item));
            }
        } else {
            jsonableContent = Object.create(null);

            if (content.children) {
                jsonableContent.children = this.removeLinksToObjects(content.children);
            }

            for (const index in content) {
                if (content.hasOwnProperty(index)) {
                    if (index !== "next" &&
                        index !== "prev" &&
                        index !== "__proto__" &&
                        index !== "prototype" &&
                        index !== "parent" &&
                        index !== "children"
                    ) {
                        jsonableContent[index] = content[index];
                    }
                }
            }
        }

        return jsonableContent;
    }
}
