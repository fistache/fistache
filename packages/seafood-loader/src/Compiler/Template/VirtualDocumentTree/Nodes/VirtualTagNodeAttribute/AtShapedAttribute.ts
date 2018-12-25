import {IForTagExpression, VirtualTagNodePresentState} from "../VirtualTagNode";
import {NonStaticAttribute} from "./NonStaticAttribute";
import {REACTIVE_PROPERTY_FLAG} from "@seafood/app";

// import {REACTIVE_PROPERTY_FLAG} from "@seafood/app";

export class AtShapedAttribute extends NonStaticAttribute {
    private isIfAttributeSwitchedValue: boolean = false;

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
        const expressionParts = this.value.split(" of ");
        const scopeNewVarName = expressionParts[0];
        const expression = expressionParts[1];
        const virtualTagNode = this.getVirtualTagNode();
        const scope = virtualTagNode.getScope();

        if (scopeNewVarName.length && expression.length) {
            const expressionResult = scope.executeExpression(expression, (value: any) => {
                // todo: add reactivity
            });
            const forOfData: IForTagExpression = {
                newVariableName: scopeNewVarName,
                value: expressionResult,
            };

            virtualTagNode.setForOfData(forOfData);
        } else {
            console.warn("Variable name or expression is not provided in for..of attribute.");
        }
    }

    protected appendForInAttribute(): void {
        const expressionParts = this.value.split(" in ");
        const scopeNewVarName = expressionParts[0];
        const expression = expressionParts[1];
        const virtualTagNode = this.getVirtualTagNode();
        const scope = virtualTagNode.getScope();

        if (scopeNewVarName.length && expression.length) {
            const expressionResult = scope.executeExpression(expression, () => {
                // todo: add reactivity
            });
            const forInData: IForTagExpression = {
                newVariableName: scopeNewVarName,
                value: expressionResult,
            };

            virtualTagNode.setForInData(forInData);
        } else {
            console.warn("Variable name or expression is not provided in for..of attribute.");
        }
    }

    protected appendForNAttribute(): void {
        const virtualTagNode = this.getVirtualTagNode();
        const scope = virtualTagNode.getScope();

        if (this.value.length) {
            const expressionResult = scope.executeExpression(this.value, (value: any) => {
                // todo: add reactivity
                virtualTagNode.updateForNData(value);
            });

            virtualTagNode.setForNData(expressionResult);
        } else {
            console.warn("Variable name or expression is not provided in @for attribute.");
        }
    }

    protected appendIfAttribute(): void {
        const virtualTagNode = this.getVirtualTagNode();
        const scope = virtualTagNode.getScope();
        const expressionValue = scope.executeExpression(this.value, (updatedExpressionValue: any) => {
            this.updateIfAttribute(updatedExpressionValue);
            this.rerenderIfAttribute();
        });
        this.updateIfAttribute(expressionValue);
    }

    private updateIfAttribute(expressionValue: any) {
        const virtualTagNode = this.getVirtualTagNode();
        let virtualTagNodeNewPresentState;

        if (expressionValue) {
            virtualTagNodeNewPresentState = VirtualTagNodePresentState.Present;
        } else {
            virtualTagNodeNewPresentState = VirtualTagNodePresentState.Missing;
        }

        this.isIfAttributeSwitchedValue = virtualTagNodeNewPresentState !== virtualTagNode.getPresentState();
        if (this.isIfAttributeSwitchedValue) {
            virtualTagNode.setPresentState(virtualTagNodeNewPresentState);
        }
    }

    private rerenderIfAttribute() {
        if (this.isIfAttributeSwitchedValue) {
            const virtualTagNode = this.getVirtualTagNode();

            virtualTagNode.removeBuildedNodeFromDom();
            virtualTagNode.setBuildedNode(virtualTagNode.buildNode());
            virtualTagNode.renderIfNodeExists();
        }
    }
}
