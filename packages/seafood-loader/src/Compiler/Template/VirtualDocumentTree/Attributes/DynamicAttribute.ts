import { VirtualTagNode } from '../Nodes/VirtualTagNode'
import { NonStaticAttribute } from './NonStaticAttribute'

export class DynamicAttribute extends NonStaticAttribute {
    public append(): void {
        const virtualTagNode = this.getVirtualNode() as VirtualTagNode
        const attributeName = this.getName()
        const scope = virtualTagNode.getScope()
        const expressionResult = scope.executeExpression(this.value, (value: any) => {
            this.setAttribute(attributeName, value)
        })

        this.setAttribute(attributeName, expressionResult)
    }
}
