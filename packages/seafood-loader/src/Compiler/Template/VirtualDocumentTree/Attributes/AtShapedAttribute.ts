import { VirtualTagNode } from '../Nodes/VirtualTagNode'
import { NonStaticAttribute } from './NonStaticAttribute'

export class AtShapedAttribute extends NonStaticAttribute {
    public append(): void {
        this.resolveAttributeByName(this.getName())
    }

    protected resolveAttributeByName(name: string): void {
        switch (name) {
            case('if'):
                this.appendIfAttribute()
                break
            default:
                console.warn(`Attribute ${this.name} is unknown.`)
                break
        }
    }

    protected appendIfAttribute(): void {
        const virtualTagNode = this.getVirtualNode() as VirtualTagNode
        const scope = virtualTagNode.getScope()
        const expressionResult = scope.executeExpression(this.value, (value: any) => {
            virtualTagNode.updateIfAttributeValue(value)
        })

        virtualTagNode.updateIfAttributeValue(expressionResult)
    }
}
