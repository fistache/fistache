import {VirtualTagNodeForExpression} from "../VirtualTagNodeCollection";
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
        const expressionParts = this.value.split(" of ", 2);
        const variableName = expressionParts[0];
        const expression = expressionParts[1];

        const collection = this.getCollection();
        const scope = collection.getScope();

        if (variableName.length && expression.length) {
            const expressionResult = scope.executeExpression(
                expression,
                (value: any, depth?: number) => {
                console.log(value, depth);
                if (!depth || depth <= 1) {
                    // collection.updateForOfExpression(value);
                }
            });
            console.log(expressionResult);
            const forExpression: VirtualTagNodeForExpression = {
                variableName,
                expression,
                value: expressionResult,
            };

            collection.setForOfExpression(forExpression);
        } else {
            console.warn("Variable name or expression is not provided in @for..of attribute.");
        }
    }

    protected appendForInAttribute(): void {
        const expressionParts = this.value.split(" in ", 2);
        const variableName = expressionParts[0];
        const expression = expressionParts[1];

        const collection = this.getCollection();
        const scope = collection.getScope();

        if (variableName.length && expression.length) {
            const expressionResult = scope.executeExpression(expression, () => {
                // чтобы работало, нужно раскомменить parent.notify
                // в app/component
                // todo: add reactivity
            });
            const forExpression: VirtualTagNodeForExpression = {
                variableName,
                expression,
                value: expressionResult,
            };

            collection.setForInExpression(forExpression);
        } else {
            console.warn("Variable name or expression is not provided in @for..in attribute.");
        }
    }

    protected appendForNAttribute(): void {
        const collection = this.getCollection();
        const scope = collection.getScope();

        if (this.value.length) {
            const expressionResult = scope.executeExpression(this.value, () => {
                // todo: add reactivity
                // collection.updateForNExpression(value);
            });
            const forExpression: VirtualTagNodeForExpression = {
                expression: this.value,
                value: expressionResult,
            };

            collection.setForNExpression(forExpression);
        } else {
            console.warn("Variable name or expression is not provided in @for attribute.");
        }
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
