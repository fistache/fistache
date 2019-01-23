import 'reflect-metadata'

export const DECORATOR_ATTRIBUTE_FLAG = 'attribute'

export interface AttributeProperties {
    required?: boolean
}

export function attribute(properties?: AttributeProperties) {
    if (!properties) {
        properties = {
            required: false
        }
    }

    return (target: any, propertyKey: string | symbol) => {
        Reflect.defineMetadata(DECORATOR_ATTRIBUTE_FLAG, properties, target, propertyKey)
        target[propertyKey] = null
    }
}
