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
    public static renderAtShapedAttributes(virtualTagNode: VirtualTagNode) {
        this.appendAttributesOfTypes(virtualTagNode, [
            VirtualTagAttributeType.AtShaped,
        ]);
    }

    public static renderDynamicAndStaticAttributes(virtualTagNode: VirtualTagNode) {
        this.appendAttributesOfTypes(virtualTagNode, [
            VirtualTagAttributeType.Dynamic,
            VirtualTagAttributeType.Static,
        ]);
    }

    private static appendAttributesOfTypes(virtualTagNode: VirtualTagNode, types: VirtualTagAttributeType[]) {
        const manager = new this();
        const parsedNode = virtualTagNode.getParsedNode();
        const atShapedAttributes = manager.filterAttributes(virtualTagNode, parsedNode.attribs, types);

        for (const attribute of atShapedAttributes) {
            attribute.append();
        }
    }

    protected filterAttributes(
        virtualTagNode: VirtualTagNode,
        attributes: any[],
        attributeTypes?: VirtualTagAttributeType[],
    ): Attribute[] {
        const filteredAttributes: Attribute[] = [];

        for (const attributeName in attributes) {
            if (attributes.hasOwnProperty(attributeName)) {
                const attributeValue = attributes[attributeName];

                if (this.testIsThisAtShapedDynamicAttribute(attributeName)) {
                    if (typeof attributeTypes === "undefined"
                        || attributeTypes.includes(VirtualTagAttributeType.AtShapedDynamic)
                    ) {
                        filteredAttributes.push(
                            new AtShapedDynamicAttribute(virtualTagNode, attributeName, attributeValue),
                        );
                    }
                } else if (this.testIsThisAtShapedAttribute(attributeName)) {
                    if (typeof attributeTypes === "undefined"
                        || attributeTypes.includes(VirtualTagAttributeType.AtShaped)
                    ) {
                        filteredAttributes.push(
                            new AtShapedAttribute(virtualTagNode, attributeName, attributeValue),
                        );
                    }
                } else if (this.testIsThisDynamicAttribute(attributeName)) {
                    if (typeof attributeTypes === "undefined"
                        || attributeTypes.includes(VirtualTagAttributeType.Dynamic)
                    ) {
                        filteredAttributes.push(
                            new DynamicAttribute(virtualTagNode, attributeName, attributeValue),
                        );
                    }
                } else {
                    if (typeof attributeTypes === "undefined"
                        || attributeTypes.includes(VirtualTagAttributeType.Static)
                    ) {
                        filteredAttributes.push(
                            new StaticAttribute(virtualTagNode, attributeName, attributeValue),
                        );
                    }
                }
            }
        }

        return filteredAttributes;
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

    /////
    /////
    // /////
    //
    // protected renderAttributes(): void {
    //     const attribs = this.parsedElement.attribs;
    //     for (const attribName in attribs) {
    //         if (attribs.hasOwnProperty(attribName)) {
    //             this.renderAttribute(attribName, attribs[attribName]);
    //         }
    //     }
    // }
    //
    // protected renderAttribute(name: string, value: string) {
    //     if (this.isItDynamicAttribute(name)) {
    //         this.bindDynamicAttribute(name, value);
    //     } else if (
    //         !this.isItSystemAttribute(name) &&
    //         !this.isItDynamicAndConditionalAttribute(name)
    //     ) {
    //         this.bindStaticAttribute(name, value);
    //     }
    // }
    //
    // protected renderSystemAttributes() {
    //     const attribs = this.parsedElement.attribs;
    //     for (const attribName in attribs) {
    //         if (attribs.hasOwnProperty(attribName)) {
    //             if (this.isItSystemAttribute(attribName)) {
    //                 this.bindSystemAttribute(attribName, attribs[attribName]);
    //             } else if (this.isItDynamicAndConditionalAttribute(attribName)) {
    //                 this.bindDynamicAndConditionalAttribute(attribName, attribs[attribName]);
    //             }
    //         }
    //     }
    // }
    //
    // protected addReactivityToAttribute(name: string, value: string) {
    //     if (this.isItDynamicAttribute(name)) {
    //         this.resolveDependentVars([value], () => {
    //             this.renderAttribute(name, value);
    //         });
    //     } else if (this.isItSystemAttribute(name) ||
    //         this.isItDynamicAndConditionalAttribute(name)
    //     ) {
    //         this.resolveDependentVars([value], () => {
    //             this.rerender();
    //         });
    //     }
    // }
    //
    // protected isItDynamicAndConditionalAttribute(attribName: string): boolean {
    //     const regex = new RegExp(/^(@[a-zA-Z0-9_.-]+(?<!-))?(:[a-zA-Z0-9_.-]+(?<!-))?$/);
    //     return regex.test(attribName);
    // }
    //
    // protected isItDynamicAttribute(attribName: string): boolean {
    //     const regex = new RegExp(/^(:[a-zA-Z0-9_.-]+(?<!-))$/);
    //     return regex.test(attribName);
    // }
    //
    // protected isItSystemAttribute(attribName: string): boolean {
    //     const regex = new RegExp(/^(@[a-zA-Z0-9_.-]+(?<!-))$/);
    //     return regex.test(attribName);
    // }
    //
    // protected bindDynamicAndConditionalAttribute(name: string, value: string): void {
    //     // @if:products="products"
    //     // @if:products
    // }
    //
    // protected bindSystemAttribute(name: string, value: string): void {
    //     switch (name) {
    //         case("@if"):
    //             this.bindIfSystemAttribute(value);
    //             break;
    //     }
    //     // console.log("system", name, value);
    // }
    //
    // protected bindIfSystemAttribute(value: string): void {
    //     const property = this.getComponentPropertyByVariableName(value);
    //     const realValue = property.obj[property.varName];
    //     if (realValue) {
    //         this.renderedElement = null;
    //     } else {
    //         this.renderedElement = this.invisibleFragment;
    //     }
    // }
    //
    // protected bindDynamicAttribute(name: string, value: string): void {
    //     const realName = this.getRealNameOfDynamicAttribute(name);
    //     const property = this.getComponentPropertyByVariableName(value);
    //
    //     this.bindStaticAttribute(realName, property.obj[property.varName]);
    // }
    //
    // protected bindStaticAttribute(name: string, value: string): void {
    //     this.renderedElement.setAttribute(name, value);
    // }
    //
    // protected getRealNameOfDynamicAttribute(name: string): string {
    //     return name.slice(1);
    // }
}
