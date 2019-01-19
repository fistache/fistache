import { ParsedDataAttribs } from '../../../ParsedData'
import { VirtualElement } from '../VirtualElement/VirtualElement'
import { Attribute } from './Attribute'
import { DynamicAttribute } from './DynamicAttribute'
import { StaticAttribute } from './StaticAttribute'
import { TechnicalAttribute } from './TechnicalAttribute'
import { TechnicalDynamicAttribute } from './TechnicalDynamicAttribute'

export class AttributeContainer {
    private virtualElement: VirtualElement

    private staticAttributes: Set<StaticAttribute>
    private dynamicAttributes: Set<DynamicAttribute>
    private technicalAttributes: Set<TechnicalAttribute>
    private technicalDynamicAttributes: Set<TechnicalDynamicAttribute>

    constructor(virtualElement: VirtualElement) {
        this.virtualElement = virtualElement
        this.staticAttributes = new Set()
        this.dynamicAttributes = new Set()
        this.technicalAttributes = new Set()
        this.technicalDynamicAttributes = new Set()
    }

    public getStaticAttributes(): Set<StaticAttribute> {
        return this.staticAttributes
    }

    public getDynamicAttributes(): Set<DynamicAttribute> {
        return this.dynamicAttributes
    }

    public getTeachnicalAttributes(): Set<TechnicalAttribute> {
        return this.technicalAttributes
    }

    public getTechnicalDynamicAttributes(): Set<TechnicalDynamicAttribute> {
        return this.technicalDynamicAttributes
    }

    public setStaticAttributes(attibutes: Set<StaticAttribute>) {
        this.staticAttributes = attibutes
    }

    public setDynamicAttributes(attibutes: Set<DynamicAttribute>) {
        this.dynamicAttributes = attibutes
    }

    public setTeachnicalAttributes(attibutes: Set<TechnicalAttribute>) {
        this.technicalAttributes = attibutes
    }

    public setTechnicalDynamicAttributes(attibutes: Set<TechnicalDynamicAttribute>) {
        this.technicalDynamicAttributes = attibutes
    }

    public extend(attributeContainer: AttributeContainer) {
        this.setStaticAttributes(attributeContainer.getStaticAttributes())
        this.setDynamicAttributes(attributeContainer.getDynamicAttributes())
        this.setTeachnicalAttributes(attributeContainer.getTeachnicalAttributes())
        this.setTechnicalDynamicAttributes(attributeContainer.getTechnicalDynamicAttributes())
    }

    public initialize(attribs?: ParsedDataAttribs) {
        if (attribs) {
            if (attribs.static) {
                for (const attribute of attribs.static) {
                    this.staticAttributes.add(new StaticAttribute(attribute))
                }
            }

            if (attribs.dynamic) {
                for (const attribute of attribs.dynamic) {
                    this.dynamicAttributes.add(new DynamicAttribute(attribute))
                }
            }

            if (attribs.technical) {
                for (const attribute of attribs.technical) {
                    this.technicalAttributes.add(new TechnicalAttribute(attribute))
                }
            }

            if (attribs.technicalDynamic) {
                for (const attribute of attribs.technicalDynamic) {
                    this.technicalDynamicAttributes.add(new TechnicalDynamicAttribute(attribute))
                }
            }
        }
    }

    public renderStaticAttributes() {
        this.renderAttributes(this.getStaticAttributes())
    }

    public renderDynamicAttributes() {
        this.renderAttributes(this.getDynamicAttributes())
    }

    public renderTechnicalAttributes() {
        this.renderAttributes(this.getTeachnicalAttributes())
    }

    private renderAttributes(attributes: Set<Attribute>) {
        attributes.forEach((attribute: Attribute) => {
            attribute.setVirtualElement(this.virtualElement)
            attribute.append()
        })
    }
}
