import {VirtualTagNode} from "../Nodes/VirtualTagNode";
import {Attribute} from "./Attribute";

export class StaticAttribute extends Attribute {
    public getName(): string {
        return this.name;
    }

    public append(): void {
        this.setAttribute(this.getName(), this.value);
    }

    protected setAttribute(name: string, value: string): void {
        const virtualTagNode = this.getVirtualNode() as VirtualTagNode;
        const buildedNode = virtualTagNode.getBuildedNode();

        if (buildedNode) {
            buildedNode.setAttribute(name, value);
        }
    }
}
