import {VirtualTagNodePresentState} from "../VirtualTagNode";
import {NonStaticAttribute} from "./NonStaticAttribute";

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
            default:
                console.warn(`Attribute ${this.name} is unknown.`);
                break;
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
