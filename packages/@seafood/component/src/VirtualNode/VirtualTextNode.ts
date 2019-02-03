import { VirtualNode } from './VirtualNode'

export class VirtualTextNode extends VirtualNode {
    private readonly expression: string

    constructor(expression: string) {
        super()
        this.expression = expression
    }

    protected makeNode(): Node | void | null {
        const scope = this.getScope()
        const expressionResult = scope.executeExpression(
            this.expression,
            (value: any) => {
                const node = this.getNode() as Text
                node.textContent = value
            }
        )

        return document.createTextNode(expressionResult)
    }
}
