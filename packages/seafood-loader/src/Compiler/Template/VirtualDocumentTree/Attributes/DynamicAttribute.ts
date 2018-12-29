import {VirtualTagNode} from "../Nodes/VirtualTagNode";
import {NonStaticAttribute} from "./NonStaticAttribute";

export class DynamicAttribute extends NonStaticAttribute {
    public append(): void {
        const collection = this.getCollection();
        const attributeName = this.getName();

        collection.useCollection((virtualTagNode: VirtualTagNode) => {
            const buildedNode = virtualTagNode.getBuildedNode();
            const scope = virtualTagNode.getScope();

            if (buildedNode) {
                const expressionResult = scope.executeExpression(this.value, (value: any) => {
                    buildedNode.setAttribute(attributeName, value);
                });

                buildedNode.setAttribute(attributeName, expressionResult);
            }
        });
    }
}
