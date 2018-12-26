import {NonStaticAttribute} from "./NonStaticAttribute";

export class AtShapedAttribute extends NonStaticAttribute {
    public append(): void {
        this.resolveAttributeByName(this.getName());
    }

    protected resolveAttributeByName(name: string): void {
        switch (name) {
            case("if"):
                this.appendIfAttribute();
                break;
            case("for"):
                this.resolveForAttribute();
                break;
            default:
                console.warn(`Attribute ${this.name} is unknown.`);
                break;
        }
    }

    protected resolveForAttribute(): void {
        if (this.value.includes(" of ")) {
            this.appendForOfAttribute();
        } else if (this.value.includes(" in ")) {
            this.appendForInAttribute();
        } else {
            this.appendForNAttribute();
        }
    }

    protected appendForOfAttribute(): void {
        // const expressionParts = this.value.split(" of ");
        // const scopeNewVarName = expressionParts[0];
        // const expression = expressionParts[1];
        // const collection = this.getCollection();
        // const scope = collection.getScope();
        //
        // if (scopeNewVarName.length && expression.length) {
        //     const expressionResult = scope.executeExpression(expression, () => {
        //         // todo: add reactivity
        //     });
        //     const forOfData: IForTagExpression = {
        //         newVariableName: scopeNewVarName,
        //         value: expressionResult,
        //     };
        //
        //     collection.setForOfData(forOfData);
        // } else {
        //     console.warn("Variable name or expression is not provided in for..of attribute.");
        // }
    }

    protected appendForInAttribute(): void {
        // const expressionParts = this.value.split(" in ");
        // const scopeNewVarName = expressionParts[0];
        // const expression = expressionParts[1];
        // const collection = this.getCollection();
        // const scope = collection.getScope();
        //
        // if (scopeNewVarName.length && expression.length) {
        //     const expressionResult = scope.executeExpression(expression, () => {
        //         // todo: add reactivity
        //     });
        //     const forInData: IForTagExpression = {
        //         newVariableName: scopeNewVarName,
        //         value: expressionResult,
        //     };
        //
        //     collection.setForInData(forInData);
        // } else {
        //     console.warn("Variable name or expression is not provided in for..of attribute.");
        // }
    }

    protected appendForNAttribute(): void {
        // const collection = this.getCollection();
        // const scope = collection.getScope();
        //
        // if (this.value.length) {
        //     const expressionResult = scope.executeExpression(this.value, (value: any) => {
        //         // todo: add reactivity
        //         collection.updateForNData(value);
        //     });
        //
        //     collection.setForNData(expressionResult);
        // } else {
        //     console.warn("Variable name or expression is not provided in @for attribute.");
        // }
    }

    protected appendIfAttribute(): void {
        const collection = this.getCollection();
        const scope = collection.getScope();
        const expressionValue = scope.executeExpression(this.value, (updatedExpressionValue: any) => {
            collection.updateIfAttributeValue(updatedExpressionValue);
        });

        collection.updateIfAttributeValue(expressionValue);
    }
}
