import { VirtualElement } from '../VirtualNode/VirtualElement'
import { DynamicAttribute } from './DynamicAttribute'

export class SpecialAttribute extends DynamicAttribute {
    public append() {
        this.resolveAttributeByName()
    }

    private resolveAttributeByName() {
        switch (this.name) {
            case('if'):
                this.appendIfAttribute()
                break
            // ignore for cause it's package-specific attribute
            case('for'): break
        }
    }

    private appendIfAttribute() {
        const virtualElement = this.getVirtualElement() as VirtualElement
        const scope = virtualElement.getScope()
        const expressionResult = scope.executeExpression(
            this.value as string,
            (value: any) => {
                virtualElement.updateIfAttributeValue(value)
            }
        )

        virtualElement.updateIfAttributeValue(expressionResult)
    }
}
