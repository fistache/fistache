import { VirtualElement } from '../VirtualElement/VirtualElement'
import { NonStaticAttribute } from './NonStaticAttribute'

export class TechnicalAttribute extends NonStaticAttribute {
    public append(): void {
        this.resolveAttributeByName(this.getName())
    }

    protected resolveAttributeByName(name: string): void {
        switch (name) {
            case('if'):
                this.appendIfAttribute()
                break
            case ('for'):
                // @for is special attirube only for packages
                break
            default:
                console.warn(`Attribute ${this.name} is unknown.`)
                break
        }
    }

    protected appendIfAttribute(): void {
        const virtualElement = this.getVirtualElement() as VirtualElement
        const scope = virtualElement.getScope()
        const expressionResult = scope.executeExpression(this.value, (value: any) => {
            virtualElement.updateIfAttributeValue(value)
        })

        virtualElement.updateIfAttributeValue(expressionResult)
    }
}
