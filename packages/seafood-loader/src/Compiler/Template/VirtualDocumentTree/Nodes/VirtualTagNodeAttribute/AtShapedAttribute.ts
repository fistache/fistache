import {VirtualTagNodePresentState} from "../VirtualTagNode";
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
            default:
                console.warn(`Attribute ${this.name} is unknown.`);
                break;
        }
    }

    protected appendIfAttribute(): void {
        const virtualTagNode = this.getVirtualTagNode();
        const scope = virtualTagNode.getScope();
        const rerenderFunction = () => {
            console.log("rerender", virtualTagNode);
            virtualTagNode.render();
        };
        const expressionValue = scope.executeExpression(this.value, rerenderFunction);

        console.log(scope.getAreas()[0]);

        if (!expressionValue) {
            virtualTagNode.setPresentState(VirtualTagNodePresentState.Missing);
        }
    }
}
