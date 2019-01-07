import { ParsedDataAttribs } from '../../Parser/ParsedData'
import { DynamicAttribute } from './DynamicAttribute'
import { StaticAttribute } from './StaticAttribute'
import { TechnicalAttribute } from './TechnicalAttribute'
import { TechnicalDynamicAttribute } from './TechnicalDynamicAttribute'

export class AttributeContainer {
    private staticAttributes: Set<StaticAttribute>
    private dynamicAttributes: Set<DynamicAttribute>
    private technicalAttributes: Set<TechnicalAttribute>
    private technicalDynamicAttributes: Set<TechnicalDynamicAttribute>

    constructor() {
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

    public initialize(attribs: ParsedDataAttribs) {
        for (const staticAttribute of attribs.static) {
            this.staticAttributes.add(new StaticAttribute(staticAttribute.name, staticAttribute.value))
        }
    }
}
