import {Attribute} from "./Attribute";

export class StaticAttribute extends Attribute {
    public getName(): string {
        return this.name;
    }

    public append(): void {
        const virtualTagNode = this.getVirtualTagNode();
        const buildedNode = (virtualTagNode.getBuildedNode() as Element);

        if (buildedNode) {
            buildedNode.setAttribute(this.getName(), this.value);
        }
    }
}
