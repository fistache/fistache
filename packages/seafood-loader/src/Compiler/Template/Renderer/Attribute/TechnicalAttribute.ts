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
                // @for is a special attribute only for a package
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
        // todo: разобраться почему эта функция дёргается слишком много раз
        // примерно в 3 раза чаще чем нужно

        virtualElement.updateIfAttributeValue(expressionResult)
    }
}
