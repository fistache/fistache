import { NonStaticAttribute } from './NonStaticAttribute'

export class DynamicAttribute extends NonStaticAttribute {
    public append(): void {
        // const virtualElement = this.getVirtualElement()
        // const attributeName = this.getName()
        // const scope = virtualElement.getScope()
        // const expressionResult = scope.executeExpression(this.value, (value: any) => {
        //     this.setAttribute(attributeName, value)
        // })
        //
        // this.setAttribute(attributeName, expressionResult)
    }
}
