import {VirtualTagNode} from "../VirtualTagNode";
import {AtShapedAttribute} from "./AtShapedAttribute";
import {AtShapedDynamicAttribute} from "./AtShapedDynamicAttribute";
import {Attribute} from "./Attribute";
import {DynamicAttribute} from "./DynamicAttribute";
import {StaticAttribute} from "./StaticAttribute";

export enum VirtualTagAttributeType {
    AtShaped,
    Dynamic,
    AtShapedDynamic,
    Static,
}

export class VirtualTagAttributesManager {
    private readonly virtualTagNode: VirtualTagNode;
    private filteredAttributes: Attribute[];

    public constructor(virtualTagNode: VirtualTagNode) {
        this.virtualTagNode = virtualTagNode;
        this.filteredAttributes = [];
    }

    public initialize(): void {
        this.filteredAttributes = this.computeAttributes();
    }

    public renderAtShapedAttributes() {
        this.appendAttributesOfTypes([
            VirtualTagAttributeType.AtShaped,
        ]);
    }

    public renderDynamicAndStaticAttributes() {
        this.appendAttributesOfTypes([
            VirtualTagAttributeType.Dynamic,
            VirtualTagAttributeType.Static,
        ]);
    }

    protected computeAttributes(): Attribute[] {
        const parsedNode = this.virtualTagNode.getParsedNode();
        const attributes: any[] = parsedNode.attribs;
        const filteredAttributes: Attribute[] = [];

        for (const attributeName in attributes) {
            if (attributes.hasOwnProperty(attributeName)) {
                const attributeValue = attributes[attributeName];

                if (this.testIsThisDynamicAttribute(attributeName)) {
                    filteredAttributes.push(
                        new DynamicAttribute(this.virtualTagNode, attributeName, attributeValue),
                    );
                } else if (this.testIsThisAtShapedAttribute(attributeName)) {
                    filteredAttributes.push(
                        new AtShapedAttribute(this.virtualTagNode, attributeName, attributeValue),
                    );
                } else if (this.testIsThisAtShapedDynamicAttribute(attributeName)) {
                    filteredAttributes.push(
                        new AtShapedDynamicAttribute(this.virtualTagNode, attributeName, attributeValue),
                    );
                } else {
                    filteredAttributes.push(
                        new StaticAttribute(this.virtualTagNode, attributeName, attributeValue),
                    );
                }
            }
        }

        return filteredAttributes;
    }

    protected filterAttributes(types: VirtualTagAttributeType[]): Attribute[] {
        const attributes: Attribute[] = [];

        for (const attribute of this.filteredAttributes) {
            for (const type of types) {
                if (type === VirtualTagAttributeType.Static &&
                    attribute instanceof StaticAttribute) {
                    attributes.push(attribute);
                } else if (type === VirtualTagAttributeType.Dynamic &&
                    attribute instanceof DynamicAttribute) {
                    attributes.push(attribute);
                } else if (type === VirtualTagAttributeType.AtShaped &&
                    attribute instanceof AtShapedAttribute) {
                    attributes.push(attribute);
                } else if (type === VirtualTagAttributeType.AtShapedDynamic &&
                    attribute instanceof AtShapedDynamicAttribute) {
                    attributes.push(attribute);
                }
            }
        }

        return attributes;
    }

    private appendAttributesOfTypes(types: VirtualTagAttributeType[]) {
        const attributes = this.filterAttributes(types);

        for (const attribute of attributes) {
            attribute.append();
        }
    }

    private testIsThisAtShapedAttribute(attributeName: string): boolean {
        const regex = new RegExp(/^(@[a-zA-Z0-9_.-]+(?<!-))$/);
        return regex.test(attributeName);
    }

    private testIsThisDynamicAttribute(attributeName: string): boolean {
        const regex = new RegExp(/^(:[a-zA-Z0-9_.-]+(?<!-))$/);
        return regex.test(attributeName);
    }

    private testIsThisAtShapedDynamicAttribute(attributeName: string): boolean {
        const regex = new RegExp(/^(@[a-zA-Z0-9_.-]+(?<!-))?(:[a-zA-Z0-9_.-]+(?<!-))$/);
        return regex.test(attributeName);
    }
}
