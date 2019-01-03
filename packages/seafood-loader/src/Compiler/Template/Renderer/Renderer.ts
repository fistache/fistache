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
        this.bindParsedContentPosition(this.parsedContent)
        const stack = this.parsedContent.reverse()

        while (stack.length) {
            const parsedItem = stack.pop()

            console.log(parsedItem)

            if (parsedItem.children) {
                const children = parsedItem.children

                this.bindParsedContentPosition(children)
                stack.push(...children.reverse())
            }
        }
    }

    private bindParsedContentPosition(item: any[]) {
        for (const index in item) {
            if (item.hasOwnProperty(index)) {
                item[+index].position = +index
            }
        }
    }
}
