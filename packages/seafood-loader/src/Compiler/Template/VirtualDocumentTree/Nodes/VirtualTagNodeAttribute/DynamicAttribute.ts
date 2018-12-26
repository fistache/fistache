import {NonStaticAttribute} from "./NonStaticAttribute";

export class DynamicAttribute extends NonStaticAttribute {
    public append(): void {
        const collection = this.getCollection();
        const scope = collection.getScope();
        const attributeName = this.getName();
        const expressionResult = scope.executeExpression(this.value, (value: any) => {
            this.setAttribute(attributeName, value);
        });

        this.setAttribute(attributeName, expressionResult);
    }
}
