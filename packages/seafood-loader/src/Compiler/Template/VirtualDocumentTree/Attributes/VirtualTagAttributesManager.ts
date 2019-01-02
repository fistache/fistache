import {VirtualNode} from "../VirtualNode";
import {AtShapedAttribute} from "./AtShapedAttribute";
import {AtShapedCollectionAttribute} from "./AtShapedCollectionAttribute";
import {AtShapedDynamicAttribute} from "./AtShapedDynamicAttribute";
import {Attribute} from "./Attribute";
import {DynamicAttribute} from "./DynamicAttribute";
import {StaticAttribute} from "./StaticAttribute";

export class VirtualTagAttributesManager {
    private readonly virtualNode: VirtualNode;
    private staticAttributes: StaticAttribute[];
    private dynamicAttributes: DynamicAttribute[];
    private atShapedAttributes: AtShapedAttribute[];
    private atShapedDynamicAttributes: AtShapedDynamicAttribute[];
    private atShapedCollectionAttributes: AtShapedCollectionAttribute[];

    public constructor(virtualTagNode: VirtualNode) {
        this.virtualNode = virtualTagNode;
        this.staticAttributes = [];
        this.dynamicAttributes = [];
        this.atShapedAttributes = [];
        this.atShapedDynamicAttributes = [];
        this.atShapedCollectionAttributes = [];
    }

    public initialize(): void {
        this.computeAttributes();
    }

    public extend(attributesManager: VirtualTagAttributesManager): void {
        this.setStaticAttributes(attributesManager.getStaticAttributes());
        this.setDynamicAttributes(attributesManager.getDynamicAttributes());
        this.setAtShapedAttributes(this.getAtShapedAttributes());
        this.setAtShapedDynamicAttributes(this.getAtShapedDynamicAttributes());
        this.setAtShapedCollectionAttributes(this.getAtShapedCollectionAttributes());
    }

    public getStaticAttributes(): StaticAttribute[] {
        return this.staticAttributes;
    }

    public getDynamicAttributes(): DynamicAttribute[] {
        return this.dynamicAttributes;
    }

    public getAtShapedAttributes(): AtShapedAttribute[] {
        return this.atShapedAttributes;
    }

    public getAtShapedDynamicAttributes(): AtShapedDynamicAttribute[] {
        return this.atShapedDynamicAttributes;
    }

    public getAtShapedCollectionAttributes(): AtShapedCollectionAttribute[] {
        return this.atShapedCollectionAttributes;
    }

    public setStaticAttributes(staticAttributes: StaticAttribute[]): void {
        this.staticAttributes = staticAttributes;
    }

    public setDynamicAttributes(dynamicAttributes: DynamicAttribute[]): void {
        this.dynamicAttributes = dynamicAttributes;
    }

    public setAtShapedAttributes(atShapedAttributes: AtShapedAttribute[]): void {
        this.atShapedAttributes = atShapedAttributes;
    }

    public setAtShapedDynamicAttributes(atShapedDynamicAttributes: AtShapedDynamicAttribute[]): void {
        this.atShapedDynamicAttributes = atShapedDynamicAttributes;
    }

    public setAtShapedCollectionAttributes(atShapedCollectionAttributes: AtShapedCollectionAttribute[]): void {
        this.atShapedCollectionAttributes = atShapedCollectionAttributes;
    }

    public renderAtShapedAttributes() {
        this.appendAttributes(this.atShapedAttributes);
    }

    public renderAtShapedCollectionAttributes(): void {
        this.appendAttributes(this.atShapedCollectionAttributes);
    }

    public renderDynamicAndStaticAttributes(): void {
        this.appendAttributes(this.dynamicAttributes);
        this.appendAttributes(this.staticAttributes);
    }

    protected computeAttributes(): void {
        const parsedNode = this.virtualNode.getParsedNode();
        const attributes: any[] = parsedNode.attribs;

        for (const attributeName in attributes) {
            if (attributes.hasOwnProperty(attributeName)) {
                const attributeValue = attributes[attributeName];

                if (this.testIsThisDynamicAttribute(attributeName)) {
                    this.dynamicAttributes.push(
                        new DynamicAttribute(attributeName, attributeValue),
                    );
                } else if (this.testIsThisAtShapedAttribute(attributeName)) {
                    if (attributeName === "@for") {
                        this.atShapedCollectionAttributes.push(
                            new AtShapedCollectionAttribute(attributeName, attributeValue),
                        );
                    } else {
                        this.atShapedAttributes.push(new AtShapedAttribute(attributeName, attributeValue));
                    }
                } else if (this.testIsThisAtShapedDynamicAttribute(attributeName)) {
                    this.atShapedDynamicAttributes.push(
                        new AtShapedDynamicAttribute(attributeName, attributeValue),
                    );
                } else {
                    this.staticAttributes.push(
                        new StaticAttribute(attributeName, attributeValue),
                    );
                }
            }
        }
    }

    private appendAttributes(attributes: Attribute[]) {
        for (const attribute of attributes) {
            attribute.setVirtualNode(this.virtualNode);
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
