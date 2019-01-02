import {VirtualTagNode} from "../Nodes/VirtualTagNode";
import {VirtualTagNodeForExpression} from "../VirtualTagNodeCollection";
import {NonStaticAttribute} from "./NonStaticAttribute";

export class AtShapedAttribute extends NonStaticAttribute {
    public append(): void {
        this.resolveAttributeByName(this.getName());
    }

    public appendIfAttributesOnVirtualTagNode(virtualTagNode: VirtualTagNode): void {
        if (this.getName() === "if") {
            this.appendIfAttribute(virtualTagNode);
        }
    }

    protected resolveAttributeByName(name: string): void {
        switch (name) {
            case("for"):
                this.resolveForAttribute();
                break;
            case("if"):
                this.appendIfAttribute();
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
            const expressionResult = scope.executeExpression(expression, (value: any, depth?: number) => {
                if (!depth || depth <= 1) {
                    collection.updateForOfExpression(value);
                }
            });
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
            const expressionResult = scope.executeExpression(expression, (value: any, depth?: number) => {
                if (!depth || depth <= 1) {
                    if (Number.isInteger(value) && value >= 0) {
                        collection.updateForNExpression(value);
                    } else {
                        collection.updateForInExpression(value);
                    }
                }
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
            const expressionResult = scope.executeExpression(this.value, (value: any, depth?: number) => {
                if (!depth || depth <= 1) {
                    console.log("update for..n");
                    collection.updateForNExpression(value);
                }
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

    protected appendIfAttribute(virtualTagNode?: VirtualTagNode): void {
        if (virtualTagNode) {
            const scope = virtualTagNode.getScope();
            const expressionResult = scope.executeExpression(this.value, (value: any) => {
                virtualTagNode.updateIfAttributeValue(value);
            });

            virtualTagNode.updateIfAttributeValue(expressionResult);
        }
    }
}
