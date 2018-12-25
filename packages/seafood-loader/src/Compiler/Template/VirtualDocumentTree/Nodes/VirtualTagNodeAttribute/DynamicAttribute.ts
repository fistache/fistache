import {NonStaticAttribute} from "./NonStaticAttribute";

export class DynamicAttribute extends NonStaticAttribute {
    public append(): void {
        const virtualTagNode = this.getVirtualTagNode();
        const scope = virtualTagNode.getScope();
        const attributeName = this.getName();

        const expressionResult = scope.executeExpression(this.value, (value: any) => {
            this.setAttribute(attributeName, value);
        });
        this.setAttribute(attributeName, expressionResult);
    }
}
