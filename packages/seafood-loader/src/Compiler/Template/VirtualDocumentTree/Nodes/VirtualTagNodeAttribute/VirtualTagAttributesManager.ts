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
    private readonly staticAttributes: Attribute[];
    private readonly dynamicAttributes: Attribute[];
    private readonly atShapedAttributes: Attribute[];
    private atShapedDynamicAttributes: Attribute[];

    public constructor(virtualTagNode: VirtualTagNode) {
        this.virtualTagNode = virtualTagNode;
        this.staticAttributes = [];
        this.dynamicAttributes = [];
        this.atShapedAttributes = [];
        this.atShapedDynamicAttributes = [];
    }

    public initialize(): void {
        this.computeAttributes();
    }

    public renderAtShapedAttributes() {
        this.appendAttributes(this.atShapedAttributes);
    }

    public renderDynamicAndStaticAttributes() {
        this.appendAttributes(this.dynamicAttributes);
        this.appendAttributes(this.staticAttributes);
    }

    protected computeAttributes(): void {
        const parsedNode = this.virtualTagNode.getParsedNode();
        const attributes: any[] = parsedNode.attribs;

        for (const attributeName in attributes) {
            if (attributes.hasOwnProperty(attributeName)) {
                const attributeValue = attributes[attributeName];

                if (this.testIsThisDynamicAttribute(attributeName)) {
                    this.dynamicAttributes.push(
                        new DynamicAttribute(this.virtualTagNode, attributeName, attributeValue),
                    );
                } else if (this.testIsThisAtShapedAttribute(attributeName)) {
                    this.atShapedAttributes.push(
                        new AtShapedAttribute(this.virtualTagNode, attributeName, attributeValue),
                    );
                } else if (this.testIsThisAtShapedDynamicAttribute(attributeName)) {
                    this.atShapedDynamicAttributes.push(
                        new AtShapedDynamicAttribute(this.virtualTagNode, attributeName, attributeValue),
                    );
                } else {
                    this.staticAttributes.push(
                        new StaticAttribute(this.virtualTagNode, attributeName, attributeValue),
                    );
                }
            }
        }
    }

    private appendAttributes(attributes: Attribute[]) {
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
