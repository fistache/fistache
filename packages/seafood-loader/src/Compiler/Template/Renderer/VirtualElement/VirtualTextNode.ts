import { VirtualNode } from './VirtualNode'

export class VirtualTextNode extends VirtualNode {
    private expressions = new Map<number, any>()
    private parts: string[] = []

    public beforeRender() {
        this.bindExpressions()
        super.beforeRender()
    }

    public makeNode(): Node {
        return document.createTextNode(this.getData())
    }

    private getData(): string {
        let data = ''
        let index = 0

        for (const part of this.parts) {
            data += part

            if (this.expressions.has(index)) {
                data += this.expressions.get(index)
            }

            index++
        }

        return data
    }

    private bindExpressions() {
        if (this.parsedData.data) {
            const regex = new RegExp(/{{([\S\s]*?)}}/, 'gm')
            let slicedCharIndex = 0
            let index = 0
            let result

            // tslint:disable-next-line
            while ((result = regex.exec(this.parsedData.data)) !== null) {
                const expression = result[1].trim()

                if (expression.length) {
                    this.bindExpression(expression, index)
                }

                this.addPart(slicedCharIndex, result.index)

                slicedCharIndex = regex.lastIndex
                index++
            }

            if (slicedCharIndex !== this.parsedData.data.length) {
                this.addPart(slicedCharIndex, this.parsedData.data.length)
            }
        }
    }

    private bindExpression(expression: string, index: number) {
        const value = this.getScope().executeExpression(expression, (updatedValue: any) => {
            const node = this.node as Node

            this.expressions.set(index, updatedValue)
            node.textContent = this.getData()

            /**
             * todo: update reactive property notify for objects,
             * arrays to avoid duplicate calls
             * {{ this.prop[0].id }} calls update function 3 times
             */
        })

        this.expressions.set(index, value)
    }

    private addPart(fromIndex: number, toIndex: number) {
        this.parts.push(this.parsedData.data.slice(fromIndex, toIndex))
    }
}
