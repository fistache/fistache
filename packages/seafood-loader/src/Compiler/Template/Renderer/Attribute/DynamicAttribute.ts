import camelCase from 'camelcase'
import { VirtualComponent } from '../VirtualElement/VirtualComponent'
import { VirtualElement } from '../VirtualElement/VirtualElement'
import { NonStaticAttribute } from './NonStaticAttribute'

export class DynamicAttribute extends NonStaticAttribute {
    public append(): void {
        const virtualElement = this.getVirtualElement() as VirtualElement
        const attributeName = this.getName()
        const scope = virtualElement.getScope()
        const expressionResult = scope.executeExpression(this.value, (value: any) => {
            this.bindAttribute(attributeName, value)
        })

        this.bindAttribute(attributeName, expressionResult)
    }

    private bindAttribute(name: string, value: string) {
        const virtualElement = this.getVirtualElement() as VirtualElement

        if (virtualElement instanceof VirtualComponent) {
            const component = virtualElement.getComponent()
            const attributeName = camelCase(name)

            console.log(attributeName, value)
            component.setAttribute(attributeName, value)
        } else {
            this.setAttribute(name, value)
        }
    }
}
