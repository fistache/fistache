import { AttributeKeyword, ComponentAttributes } from '@fistache/shared'
import { VirtualElement } from '../VirtualNode/VirtualElement'
import { DynamicAttribute } from './DynamicAttribute'
import { EventAttribute } from './EventAttribute'
import { InjectionAttribute } from './InjectionAttribute'
import { SpecialAttribute } from './SpecialAttribute'
import { StaticAttribute } from './StaticAttribute'

export class AttributeContainer {
    private readonly virtualElement: VirtualElement

    private staticAttributes: Set<StaticAttribute>
    private dynamicAttributes: Set<DynamicAttribute>
    private specialAttributes: Set<SpecialAttribute>
    private injectionAttributes: Set<InjectionAttribute>
    private eventAttributes: Set<EventAttribute>

    constructor(virtualElement: VirtualElement) {
        this.virtualElement = virtualElement

        this.staticAttributes = new Set()
        this.dynamicAttributes = new Set()
        this.specialAttributes = new Set()
        this.injectionAttributes = new Set()
        this.eventAttributes = new Set()
    }

    public getStaticAttributes(): Set<StaticAttribute> {
        return this.staticAttributes
    }

    public getDynamicAttributes(): Set<DynamicAttribute> {
        return this.dynamicAttributes
    }

    public getSpecialAttributes(): Set<SpecialAttribute> {
        return this.specialAttributes
    }

    public getInjectionAttributes(): Set<InjectionAttribute> {
        return this.injectionAttributes
    }

    public getEventAttributes(): Set<EventAttribute> {
        return this.eventAttributes
    }

    public setStaticAttributes(attibutes: Set<StaticAttribute>) {
        this.staticAttributes = attibutes
    }

    public setDynamicAttributes(attibutes: Set<DynamicAttribute>) {
        this.dynamicAttributes = attibutes
    }

    public setSpecialAttributes(attibutes: Set<SpecialAttribute>) {
        this.specialAttributes = attibutes
    }

    public setInjectionAttributes(attibutes: Set<InjectionAttribute>) {
        this.injectionAttributes = attibutes
    }

    public setEventAttributes(attibutes: Set<EventAttribute>) {
        this.eventAttributes = attibutes
    }

    public extend(attributeContainer: AttributeContainer) {
        this.setStaticAttributes(attributeContainer.getStaticAttributes())
        this.setDynamicAttributes(attributeContainer.getDynamicAttributes())
        this.setSpecialAttributes(attributeContainer.getSpecialAttributes())
        this.setInjectionAttributes(attributeContainer.getInjectionAttributes())
        this.setEventAttributes(attributeContainer.getEventAttributes())
    }

    public initialize(attribs?: ComponentAttributes) {
        if (attribs) {
            if (attribs[AttributeKeyword.Event]) {
                for (const attribute of attribs[AttributeKeyword.Event]) {
                    this.eventAttributes.add(new EventAttribute(attribute))
                }
            }

            if (attribs[AttributeKeyword.Injection]) {
                for (const attribute of attribs[AttributeKeyword.Injection]) {
                    this.injectionAttributes.add(
                        new InjectionAttribute(attribute)
                    )
                }
            }

            if (attribs[AttributeKeyword.Dynamic]) {
                for (const attribute of attribs[AttributeKeyword.Dynamic]) {
                    this.staticAttributes.add(new DynamicAttribute(attribute))
                }
            }

            if (attribs[AttributeKeyword.Static]) {
                for (const attribute of attribs[AttributeKeyword.Static]) {
                    this.staticAttributes.add(new StaticAttribute(attribute))
                }
            }

            if (attribs[AttributeKeyword.Special]) {
                for (const attribute of attribs[AttributeKeyword.Special]) {
                    this.specialAttributes.add(new SpecialAttribute(attribute))
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

    public renderEventAttributes() {
        this.renderAttributes(this.getEventAttributes())
    }

    public renderSpecialAttributes() {
        this.renderAttributes(this.getSpecialAttributes())
    }

    public renderInjectionAttributes() {
        this.renderAttributes(this.getInjectionAttributes())
    }

    private renderAttributes(attributes: Set<StaticAttribute>) {
        attributes.forEach((attribute: StaticAttribute) => {
            attribute.setVirtualElement(this.virtualElement)
            attribute.append()
        })
    }
}
