import HtmlParser from "htmlparser2";
import {SynchronousPromise} from "synchronous-promise";

export class Parser {
    private source: string;
    private parsedContent: any;

    public constructor(source: string) {
        this.source = source;
        this.parseContent();
    }

    public getParsedContent(): any {
        return this.parsedContent;
    }

    public parseContent(): void {
        let parsedContent: any;
        this.parseFragment(this.source).then((content: any) => {
            parsedContent = content;
        }).catch((error: any) => {
            throw new Error(error);
        });

        this.parsedContent = this.removeLinksToObjects(parsedContent);
    }

    public parseFragment(fragment: string): SynchronousPromise<any> {
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
