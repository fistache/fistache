import {NonStaticAttribute} from "./NonStaticAttribute";

export class AtShapedAttribute extends NonStaticAttribute {
    public append(): void {
        // const virtualTagNode = this.getVirtualTagNode();
        // const buildedNode = (virtualTagNode.getBuildedNode() as Element);
        //
        // if (buildedNode) {
        //     buildedNode.setAttribute(this.getName(), this.value);
        // }

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
        const expressionValue = scope.executeExpression(this.value);
        console.log(expressionValue);
    }
}
